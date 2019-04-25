import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import { NotificationEvent, NotificationType } from '../models/NotificationEvent';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import DomMethods from '../shared/DomMethods';
import StTransport from '../classes/StTransport.class';

const ApplePaySession = (window as any).ApplePaySession;

/**
 * Apple Pay flow:
 * 1. Check if ApplePaySession class exists (it must be iOS 10 and later and macOS 10.12 and later).
 * 2. Call setApplePayVersion() to set latest available ApplePay version.
 * 3. Call setSupportedNetworks() to set available networks which are supported in this particular version of Apple Pay.
 * 4. Call setAmountAndCurrency() to set amount and currency hidden in provided JWT.
 * 5. Call createApplePayButton(), setApplePayButtonProps() and addApplePayButton) to provide styled button for launching Apple Pay Process.
 * 6. Call applePayProcess() which checks by canMakePayments() and canMakePaymentsWithActiveCard(merchantID) the capability of device for making Apple Pay payments and if there is at least one card in  users Wallet.
 * 7. User taps / clicks ApplePayButton on page and this event triggers applePayButtonClickHandler() - this is obligatory process -it has to be triggered by users action.
 * 8. Clicking button triggers paymentProcess() which sets ApplePaySession object.
 * 9. Then this.session.begin() is called which begins validating merchant process and display payment sheet.
 * 10. this.onValidateMerchantRequest() - triggers onvalidatemerchant which literally validates merchant.
 * 11. this.subscribeStatusHandlers() - if merchant has been successfully validated, three handlers are set - onpaymentmethodselected,  onshippingmethodselected, onshippingcontactselected
 *     to handle customer's selections in the payment sheet to complete transaction cost.
 *     We've got 30 seconds to handle each event before the payment sheet times out: completePaymentMethodSelection, completeShippingMethodSelection, and completeShippingContactSelection
 * 12.Then onPaymentAuthorized() or onPaymentCanceled() has been called which completes payment with this.session.completePayment function or canceled it with this.session.oncancel handler.

 */
class ApplePay {
  get applePayButtonProps(): any {
    return this._applePayButtonProps;
  }

  set applePayButtonProps(value: any) {
    this._applePayButtonProps = value;
  }

  set jwt(value: string) {
    this._jwt = value;
  }

  get jwt(): string {
    return this._jwt;
  }

  public applePayVersion: number;
  public buttonText: string;
  public buttonStyle: string;
  public merchantId: string;
  public messageBus: MessageBus;
  public paymentRequest: any;
  public placement: string;
  public session: any;
  public merchantSession: any;
  public sitesecurity: string;
  public stJwtInstance: StJwt;
  public stTransportInstance: StTransport;

  public static APPLE_PAY_BUTTON_ID: string = 'st-apple-pay';
  public static APPLE_PAY_MIN_VERSION: number = 2;
  public static APPLE_PAY_MAX_VERSION: number = 5;
  public static AVAILABLE_BUTTON_STYLES = ['black', 'white', 'white-outline'];
  public static AVAILABLE_BUTTON_TEXTS = ['plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'];
  public static BASIC_SUPPORTED_NETWORKS = [
    'amex',
    'chinaUnionPay',
    'discover',
    'interac',
    'jcb',
    'masterCard',
    'privateLabel',
    'visa'
  ];
  public static VERSION_3_4_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat([
    'cartesBancaires',
    'eftpos',
    'electron',
    'maestro',
    'vPay'
  ]);
  public static VERSION_5_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat(['elo', 'mada']);
  private _jwt: string;
  private _applePayButtonProps: any = {};

  /**
   * All object properties are required for WALLETVERIFY request call to ST.
   */
  public validateMerchantRequestData = {
    requesttypedescription: 'WALLETVERIFY',
    walletsource: 'APPLEPAY',
    walletmerchantid: '',
    walletvalidationurl: '',
    walletrequestdomain: window.location.hostname
  };

  constructor(config: any, jwt: string) {
    const {
      props: { sitereference, sitesecurity, placement, buttonText, buttonStyle, paymentRequest, merchantId }
    } = config;
    this.jwt = jwt;
    this.merchantId = merchantId;
    this.placement = placement;
    this.paymentRequest = paymentRequest;
    this.sitereference = sitereference;
    this.sitesecurity = sitesecurity;
    this.validateMerchantRequestData.walletmerchantid = merchantId;
    this.stJwtInstance = new StJwt(jwt);
    this.stTransportInstance = new StTransport({ jwt });
    this.messageBus = new MessageBus();
    this.onInit(buttonText, buttonStyle);
  }

  /**
   * Checks if ApplePaySession object is available
   * If yes, returns ApplePaySession object, if not returns undefined.
   */
  public ifApplePayIsAvailable = () => ApplePaySession;

  /**
   * Checks whether user uses Safari and if it's version supports Apple Pay
   * @param version
   */
  public ifBrowserSupportsApplePayVersion = (version: number) => ApplePaySession.supportsVersion(version);

  /**
   * Sets the latest possible ApplePay version
   */
  public setApplePayVersion() {
    for (let i = ApplePay.APPLE_PAY_MAX_VERSION; i >= ApplePay.APPLE_PAY_MIN_VERSION; --i) {
      if (this.ifBrowserSupportsApplePayVersion(i)) {
        this.applePayVersion = i;
        return;
      } else if (i === ApplePay.APPLE_PAY_MIN_VERSION) {
        this.applePayVersion = ApplePay.APPLE_PAY_MIN_VERSION;
        return;
      }
    }
  }

  /**
   * Sets supported networks based on version of Apple Pay
   */
  public setSupportedNetworks() {
    if (this.applePayVersion <= ApplePay.APPLE_PAY_MIN_VERSION) {
      this.paymentRequest.supportedNetworks = ApplePay.BASIC_SUPPORTED_NETWORKS;
    } else if (
      this.applePayVersion > ApplePay.APPLE_PAY_MIN_VERSION &&
      this.applePayVersion < ApplePay.APPLE_PAY_MAX_VERSION
    ) {
      this.paymentRequest.supportedNetworks = ApplePay.VERSION_3_4_SUPPORTED_NETWORKS;
    } else {
      this.paymentRequest.supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
    }
  }

  /**
   * Sets styles and texts provided by Merchant on init
   * @param buttonText
   * @param buttonStyle
   */
  public setApplePayButtonProps(buttonText: string, buttonStyle: string) {
    this.ifApplePayButtonStyleIsValid(buttonStyle)
      ? (this.buttonStyle = buttonStyle)
      : (this.buttonStyle = ApplePay.AVAILABLE_BUTTON_STYLES[0]);
    this.ifApplePayButtonTextIsValid(buttonText)
      ? (this.buttonText = buttonText)
      : (this.buttonText = ApplePay.AVAILABLE_BUTTON_TEXTS[0]);

    this._applePayButtonProps['style'] = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${
      this.buttonText
    }; -applepay-button-style: ${this.buttonStyle}`;
  }

  /**
   * Creates Apple Pay button with props specified by Merchant (buttonText, buttonStyle)
   */
  public createApplePayButton = () => DomMethods.createHtmlElement.apply(this, [this._applePayButtonProps, 'div']);

  /**
   * Adds Apple Pay button to DOM
   */
  public addApplePayButton = () => DomMethods.appendChildIntoDOM(this.placement, this.createApplePayButton());

  /**
   * Checks if provided button text is one of the available for Apple Pay
   * @param buttonText
   */
  public ifApplePayButtonTextIsValid = (buttonText: string) => ApplePay.AVAILABLE_BUTTON_TEXTS.includes(buttonText);

  /**
   * Checks if provided button style is one of the available for Apple Pay
   * @param buttonStyle
   */
  public ifApplePayButtonStyleIsValid = (buttonStyle: string) => ApplePay.AVAILABLE_BUTTON_STYLES.includes(buttonStyle);

  /**
   * Simple handler for generated Apple Pay button.
   * It's obligatory due to ApplePay requirements - this action needs to be triggered by user himself by tapping/clicking button 'Pay'
   * @param elementId
   * @param event
   */
  public applePayButtonClickHandler = (elementId: string, event: string) => {
    document.getElementById(elementId).addEventListener(event, () => {
      this.paymentProcess();
    });
  };

  /**
   * Checks whether ApplePay is available on current device
   */
  public checkApplePayAvailability = () => ApplePaySession && ApplePaySession.canMakePayments();

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  public checkApplePayWalletCardAvailability = () => ApplePaySession.canMakePaymentsWithActiveCard(this.merchantId);

  /**
   * Gets Apple Pay session object based on Apple Pay version number and ApplePayPaymentRequest
   */
  public getApplePaySessionObject = () => new ApplePaySession(this.applePayVersion, this.paymentRequest);

  /**
   * Sets details encrypted in JWT into payment request
   */
  public setAmountAndCurrency() {
    if (this.paymentRequest.total.amount && this.paymentRequest.currencyCode) {
      this.paymentRequest.total.amount = this.stJwtInstance.mainamount;
      this.paymentRequest.currencyCode = this.stJwtInstance.currencyiso3a;
    } else {
      this.setNotification(NotificationType.Error, Language.translations.APPLE_PAY_AMOUNT_AND_CURRENCY);
    }
    return this.paymentRequest;
  }

  /**
   * Method which initializes:
   *  1. All settings for ApplePay flow being launched.
   *  2. apple pay process which is called here apple pay flow
   * @param buttonText
   * @param buttonStyle
   * @private
   */
  public onInit(buttonText: string, buttonStyle: string) {
    if (this.ifApplePayIsAvailable()) {
      this.setApplePayVersion();
      this.setSupportedNetworks();
      this.setAmountAndCurrency();
      this.setApplePayButtonProps(buttonText, buttonStyle);
      this.addApplePayButton();
      this.applePayProcess();
    } else {
      this.setNotification(NotificationType.Error, Language.translations.APPLE_PAY_ONLY_ON_IOS);
    }
  }

  /**
   * Make a server-to-server call to pass a payload to the Apple Pay validationURL endpoint.
   * If successful, Apple Pay servers will return a merchant session object which will be used in response to completeMerchantValidation
   */
  public onValidateMerchantRequest() {
    this.session.onvalidatemerchant = (event: any) => {
      this.validateMerchantRequestData.walletvalidationurl = event.validationURL;
      this.stTransportInstance
        .sendRequest(this.validateMerchantRequestData)
        .then(response => {
          this.onValidateMerchantResponseSuccess(response);
        })
        .catch(error => {
          const { errorcode, errormessage } = error;
          this.onValidateMerchantResponseFailure(error);
          this.setNotification(NotificationType.Error, `${errorcode}: ${errormessage}`);
        });
    };
  }

  /**
   * Handles onpaymentauthorized event and completes payment
   */
  public onPaymentAuthorized() {
    this.session.onpaymentauthorized = (event: any) => {
      this.session.completePayment({ status: ApplePaySession.STATUS_SUCCESS, errors: [] });
      this.setNotification(NotificationType.Success, Language.translations.PAYMENT_AUTHORIZED);
    };
  }

  /**
   * Handles oncancel event and set notification about it
   */
  public onPaymentCanceled() {
    this.session.oncancel = (event: any) => {
      this.setNotification(NotificationType.Warning, Language.translations.PAYMENT_WARNING);
    };
  }

  /**
   * Handles merchant validation success response
   * @param response
   */
  public onValidateMerchantResponseSuccess(response: any) {
    const { walletsession } = response;
    if (walletsession) {
      this.merchantSession = JSON.parse(walletsession);
      this.validateMerchantRequestData.walletmerchantid = this.merchantSession.merchantIdentifier;
      this.session.completeMerchantValidation(this.merchantSession);
    } else {
      this.onValidateMerchantResponseFailure(response.requestid);
    }
  }

  /**
   * Handles merchant validation error response
   * @param error
   */
  public onValidateMerchantResponseFailure(error: any) {
    this.session.abort();
    this.setNotification(NotificationType.Error, Language.translations.MERCHANT_VALIDATION_FAILURE);
  }

  /**
   * Sets payment sheet interactions handlers: onpaymentmethodselected, onshippingmethodselected, onshippingcontactselected
   */
  public subscribeStatusHandlers() {
    this.session.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this.session.completePaymentMethodSelection({
        newTotal: { label: this.paymentRequest.total.label, amount: this.paymentRequest.total.amount, type: 'final' } // what is type ??
      });
    };

    this.session.onshippingmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this.session.completeShippingMethodSelection({
        newTotal: { label: this.paymentRequest.total.label, amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };

    this.session.onshippingcontactselected = (event: any) => {
      const { shippingContact } = event;
      this.session.completeShippingContactSelection({
        newTotal: { label: this.paymentRequest.total.label, amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  /**
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  public setNotification(type: string, content: string) {
    let notificationEvent: NotificationEvent = {
      type: type,
      content: content
    };
    let messageBusEvent: MessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION,
      data: notificationEvent
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.NOTIFICATION_FRAME_IFRAME);
  }

  /**
   * Begins Apple Pay payment flow.
   */
  public paymentProcess() {
    this.session = this.getApplePaySessionObject();
    this.onValidateMerchantRequest();
    this.subscribeStatusHandlers();
    this.onPaymentAuthorized();
    this.onPaymentCanceled();
    this.session.begin();
  }

  /**
   * Sets Apple Pay button and begins Apple Pay flow
   */
  public applePayProcess() {
    if (this.checkApplePayAvailability()) {
      this.checkApplePayWalletCardAvailability().then((canMakePayments: boolean) => {
        if (canMakePayments) {
          this.applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
        } else {
          this.setNotification(NotificationType.Error, Language.translations.NO_CARDS_IN_WALLET);
        }
      });
    } else {
      this.setNotification(NotificationType.Error, Language.translations.APPLE_PAYMENT_IS_NOT_AVAILABLE);
    }
  }
}

export default ApplePay;

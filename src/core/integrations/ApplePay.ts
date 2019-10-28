import StTransport from '../classes/StTransport.class';
import { IWalletConfig } from '../models/Config';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import Payment from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import GoogleAnalytics from './GoogleAnalytics';

const ApplePaySession = (window as any).ApplePaySession;
const ApplePayError = (window as any).ApplePayError;
const ApplePayContactMap: any = {
  countryiso2a: 'countryCode',
  email: 'emailAddress',
  firstname: 'givenName',
  lastname: 'familyName',
  postcode: 'postalCode',
  premise: 'addressLines',
  telephone: 'phoneNumber',
  town: 'locality'
};

/**
 * Apple Pay flow:
 * 1. Check if ApplePaySession class exists
 *    (it must be iOS 10 and later and macOS 10.12 and later).
 * 2. Call setApplePayVersion() to set latest available ApplePay version.
 * 3. Call setSupportedNetworks() to set available networks which are supported
 *    in this particular version of Apple Pay.
 * 4. Call setAmountAndCurrency() to set amount and currency hidden in provided JWT.
 * 5. Call createApplePayButton(), _setApplePayButtonProps() and addApplePayButton)
 *    to provide styled button for launching Apple Pay Process.
 * 6. Call applePayProcess() which checks by canMakePayments() and canMakePaymentsWithActiveCard(merchantID)
 *    the capability of device for making Apple Pay payments and if there is at least one card in  users Wallet.
 * 7. User taps / clicks ApplePayButton on page and this event triggers applePayButtonClickHandler() -
 *    this is obligatory process -it has to be triggered by users action.
 * 8. Clicking button triggers paymentProcess() which sets ApplePaySession object.
 * 9. Then this.session.begin() is called which begins validating merchant process and display payment sheet.
 * 10. this.onValidateMerchantRequest() - triggers onvalidatemerchant which literally validates merchant.
 * 11. this.subscribeStatusHandlers() - if merchant has been successfully validated, three handlers are set -
 *     onpaymentmethodselected,  onshippingmethodselected, onshippingcontactselected
 *     to handle customer's selections in the payment sheet to complete transaction cost.
 *     We've got 30 seconds to handle each event before the payment sheet times out: completePaymentMethodSelection,
 *     completeShippingMethodSelection, and completeShippingContactSelection
 * 12. Then onPaymentAuthorized() or onPaymentCanceled() has been called which completes payment with
 *     this.session.completePayment function or canceled it with this.session.oncancel handler.
 */
export class ApplePay {
  get applePayButtonProps(): any {
    return this._applePayButtonProps;
  }

  get payment(): Payment {
    return this._payment;
  }

  set payment(value: Payment) {
    this._payment = value;
  }

  set jwt(value: string) {
    this._jwt = value;
  }

  get jwt(): string {
    return this._jwt;
  }

  private static APPLE_PAY_BUTTON_ID: string = 'st-apple-pay';
  private static APPLE_PAY_MIN_VERSION: number = 3;
  private static APPLE_PAY_MAX_VERSION: number = 5;
  private static AVAILABLE_BUTTON_STYLES = ['black', 'white', 'white-outline'];
  private static AVAILABLE_BUTTON_TEXTS = ['plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'];
  private static BASIC_SUPPORTED_NETWORKS = [
    'amex',
    'chinaUnionPay',
    'discover',
    'interac',
    'jcb',
    'masterCard',
    'privateLabel',
    'visa'
  ];
  private static VERSION_4_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat([
    'cartesBancaires',
    'eftpos',
    'electron',
    'maestro',
    'vPay'
  ]);
  private static VERSION_5_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat(['elo', 'mada']);

  protected applePayVersion: number;
  protected paymentDetails: string;
  private _buttonStyle: string;
  private _buttonText: string;
  private _merchantSession: any;
  private _messageBus: MessageBus;
  private _session: any;
  private _sitesecurity: string;
  private _stJwtInstance: StJwt;
  private _stTransportInstance: StTransport;

  /**
   * All object properties are required for WALLETVERIFY request call to ST.
   */
  private _validateMerchantRequestData = {
    walletmerchantid: '',
    walletrequestdomain: window.location.hostname,
    walletsource: 'APPLEPAY',
    walletvalidationurl: ''
  };

  private _jwt: string;
  private _applePayButtonProps: any = {};
  private _payment: Payment;
  private _notification: Notification;
  private _requestTypes: string[];
  private _translator: Translator;

  private _merchantId: string;
  private _paymentRequest: any;
  private _placement: string;
  private readonly _completion: { errors: []; status: string };

  constructor(config: IWalletConfig, jwt: string, gatewayUrl: string) {
    this._notification = new Notification();
    this._messageBus = new MessageBus();
    localStorage.setItem('completePayment', '');
    this.jwt = jwt;
    this._completion = {
      errors: [],
      status: ApplePaySession ? this.getPaymentSuccessStatus() : ''
    };
    this._configurePaymentProcess(jwt, config, gatewayUrl);
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { newJwt } = data;
      this._configurePaymentProcess(newJwt, config, gatewayUrl);
    });
  }

  /**
   * Checks if ApplePaySession object is available
   * If yes, returns ApplePaySession object, if not returns undefined.
   */
  protected ifApplePayIsAvailable() {
    return !!ApplePaySession;
  }

  /**
   * Sets the latest possible ApplePay version
   */
  protected setApplePayVersion() {
    for (let i = ApplePay.APPLE_PAY_MAX_VERSION; i >= ApplePay.APPLE_PAY_MIN_VERSION; --i) {
      if (this._ifBrowserSupportsApplePayVersion(i)) {
        this.applePayVersion = i;
        return;
      } else if (i === ApplePay.APPLE_PAY_MIN_VERSION) {
        this.applePayVersion = ApplePay.APPLE_PAY_MIN_VERSION;
        return;
      }
    }
  }

  /**
   * Creates Apple Pay button with props specified by Merchant (buttonText, buttonStyle)
   */
  protected createApplePayButton() {
    return DomMethods.createHtmlElement.apply(this, [this._applePayButtonProps, 'div']);
  }

  /**
   * Checks whether user is logged to Apple Pay account.
   */
  protected isUserLoggedToAppleAccount(): boolean {
    return ApplePaySession.canMakePayments();
  }

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  protected checkApplePayWalletCardAvailability() {
    return ApplePaySession.canMakePaymentsWithActiveCard(this._merchantId);
  }

  /**
   * Gets Apple Pay session object based on Apple Pay version number and ApplePayPaymentRequest
   */
  protected getApplePaySessionObject() {
    return new ApplePaySession(this.applePayVersion, this._paymentRequest);
  }

  protected getPaymentSuccessStatus() {
    return ApplePaySession.STATUS_SUCCESS;
  }

  protected getPaymentFailureStatus() {
    return ApplePaySession.STATUS_FAILURE;
  }

  /**
   * Gathers all of the init methods, sets payment info, attach Apple Pay button and add handlers.
   * Used in constructor on library init and when updateJWT method has been called.
   * @param jwt
   * @param config
   * @param gatewayUrl
   * @private
   */
  private _configurePaymentProcess(jwt: string, config: IWalletConfig, gatewayUrl: string) {
    const { sitesecurity, placement, buttonText, buttonStyle, paymentRequest, merchantId, requestTypes } = config;
    this._merchantId = merchantId;
    this._placement = placement;
    this.payment = new Payment(jwt, gatewayUrl);
    this._paymentRequest = paymentRequest;
    this._sitesecurity = sitesecurity;
    this._requestTypes = requestTypes;
    this._validateMerchantRequestData.walletmerchantid = merchantId;
    this._stJwtInstance = new StJwt(jwt);
    this._stTransportInstance = new StTransport({
      gatewayUrl,
      jwt
    });
    this._translator = new Translator(this._stJwtInstance.locale);
    this._onInit(buttonText, buttonStyle);
  }

  /**
   * Sets supported networks based on version of Apple Pay
   * @private
   */
  private _setSupportedNetworks() {
    if (this.applePayVersion <= ApplePay.APPLE_PAY_MIN_VERSION) {
      this._paymentRequest.supportedNetworks = ApplePay.BASIC_SUPPORTED_NETWORKS;
    } else if (
      this.applePayVersion > ApplePay.APPLE_PAY_MIN_VERSION &&
      this.applePayVersion < ApplePay.APPLE_PAY_MAX_VERSION
    ) {
      this._paymentRequest.supportedNetworks = ApplePay.VERSION_4_SUPPORTED_NETWORKS;
    } else {
      this._paymentRequest.supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
    }
  }

  /**
   * Sets styles and texts provided by Merchant on init
   * @param buttonText
   * @param buttonStyle
   * @private
   */
  private _setApplePayButtonProps(buttonText: string, buttonStyle: string) {
    this._ifApplePayButtonStyleIsValid(buttonStyle)
      ? (this._buttonStyle = buttonStyle)
      : (this._buttonStyle = ApplePay.AVAILABLE_BUTTON_STYLES[0]);
    this._ifApplePayButtonTextIsValid(buttonText)
      ? (this._buttonText = buttonText)
      : (this._buttonText = ApplePay.AVAILABLE_BUTTON_TEXTS[0]);

    // tslint:disable-next-line: max-line-length
    this._applePayButtonProps.style = `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${
      this._buttonText
    }; -apple-pay-button-style: ${this._buttonStyle}`;
  }

  /**
   * Adds Apple Pay button to DOM
   * @private
   */
  private _addApplePayButton = () => DomMethods.appendChildIntoDOM(this._placement, this.createApplePayButton());

  /**
   * Checks if provided button text is one of the available for Apple Pay
   * @param buttonText
   * @private
   */
  private _ifApplePayButtonTextIsValid = (buttonText: string) => ApplePay.AVAILABLE_BUTTON_TEXTS.includes(buttonText);

  /**
   * Checks if provided button style is one of the available for Apple Pay
   * @param buttonStyle
   * @private
   */
  private _ifApplePayButtonStyleIsValid = (buttonStyle: string) =>
    ApplePay.AVAILABLE_BUTTON_STYLES.includes(buttonStyle);

  /**
   * Simple handler for generated Apple Pay button.
   * It's obligatory due to ApplePay requirements -
   * this action needs to be triggered by user himself by tapping/clicking button 'Pay'
   * @param elementId
   * @param event
   * @private
   */
  private _applePayButtonClickHandler = (elementId: string, event: string) => {
    document.getElementById(elementId).addEventListener(event, () => {
      this._paymentProcess();
    });
  };

  /**
   * Sets details encrypted in JWT into payment request
   * @private
   */
  private _setAmountAndCurrency() {
    if (this._paymentRequest.total.amount && this._paymentRequest.currencyCode) {
      this._paymentRequest.total.amount = this._stJwtInstance.mainamount;
      this._paymentRequest.currencyCode = this._stJwtInstance.currencyiso3a;
    } else {
      this._notification.error(Language.translations.APPLE_PAY_AMOUNT_AND_CURRENCY, true);
    }
    return this._paymentRequest;
  }

  /**
   * Method which initializes:
   *  1. All settings for ApplePay flow being launched.
   *  2. apple pay process which is called here apple pay flow
   * @param buttonText
   * @param buttonStyle
   * @private
   */
  private _onInit(buttonText: string, buttonStyle: string) {
    if (this.ifApplePayIsAvailable()) {
      this.setApplePayVersion();
      this._setSupportedNetworks();
      this._setAmountAndCurrency();
      this._setApplePayButtonProps(buttonText, buttonStyle);
      this._addApplePayButton();
      this._applePayProcess();
    }
  }

  /**
   * Make a server-to-server call to pass a payload to the
   * Apple Pay validationURL endpoint.
   *
   * If successful, Apple Pay servers will return a merchant session object
   * which will be used in response to completeMerchantValidation
   * @private
   */
  private _onValidateMerchantRequest() {
    this._session.onvalidatemerchant = (event: any) => {
      this._validateMerchantRequestData.walletvalidationurl = event.validationURL;
      return this.payment
        .walletVerify(this._validateMerchantRequestData)
        .then(({ response }: any) => {
          this._onValidateMerchantResponseSuccess(response);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
        })
        .catch(error => {
          const { errorcode, errormessage } = error;
          this._onValidateMerchantResponseFailure(error);
          this._notification.error(`${errorcode}: ${errormessage}`, true);
          GoogleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            'merchant validation',
            'Apple Pay merchant validation failure'
          );
        });
    };
  }

  /**
   * Handles onpaymentauthorized event and completes payment
   * @private
   */
  private _onPaymentAuthorized() {
    this._session.onpaymentauthorized = (event: any) => {
      this.paymentDetails = JSON.stringify(event.payment);
      return this.payment
        .processPayment(
          this._requestTypes,
          {
            walletsource: this._validateMerchantRequestData.walletsource,
            wallettoken: this.paymentDetails
          },
          DomMethods.parseMerchantForm()
        )
        .then((response: any) => {
          const { errorcode } = response;
          this._handleApplePayError(response);
          this._session.completePayment(this._completion);
          this._displayNotification(errorcode);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
          localStorage.setItem('completePayment', 'true');
        })
        .catch(() => {
          this._notification.error(Language.translations.PAYMENT_ERROR, true);
          this._session.completePayment({ status: this.getPaymentFailureStatus(), errors: [] });
          localStorage.setItem('completePayment', 'true');
        });
    };
  }

  /**
   * Checks whether user uses Safari and if it's version supports Apple Pay
   * @param version
   * @private
   */
  private _ifBrowserSupportsApplePayVersion = (version: number) => {
    return ApplePaySession.supportsVersion(version);
  };

  /**
   * Handles oncancel event and set notification about it
   * @private
   */
  private _onPaymentCanceled() {
    this._session.oncancel = (event: any) => {
      this._notification.warning(Language.translations.PAYMENT_CANCELLED, true);
      GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    };
  }

  /**
   * Handles merchant validation success response
   * @param response
   * @private
   */
  private _onValidateMerchantResponseSuccess(response: any) {
    const { requestid, walletsession } = response;
    if (walletsession) {
      this._merchantSession = JSON.parse(walletsession);
      this._session.completeMerchantValidation(this._merchantSession);
    } else {
      this._onValidateMerchantResponseFailure(requestid);
    }
  }

  /**
   * Handles merchant validation error response
   * @param error
   * @private
   */
  private _onValidateMerchantResponseFailure(error: any) {
    this._session.abort();
    this._notification.error(Language.translations.MERCHANT_VALIDATION_FAILURE, true);
  }

  /**
   * Sets payment sheet interactions handlers: onpaymentmethodselected,
   * onshippingmethodselected, onshippingcontactselected
   * @private
   */
  private _subscribeStatusHandlers() {
    this._session.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this._session.completePaymentMethodSelection({
        // what is type ??
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };

    this._session.onshippingmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this._session.completeShippingMethodSelection({
        newTotal: { label: this._paymentRequest.total.label, amount: this._paymentRequest.total.amount, type: 'final' }
      });
    };

    this._session.onshippingcontactselected = (event: any) => {
      const { shippingContact } = event;
      this._session.completeShippingContactSelection({
        newTotal: { label: this._paymentRequest.total.label, amount: this._paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  /**
   * Begins Apple Pay payment flow.
   * @private
   */
  private _paymentProcess() {
    localStorage.setItem('completePayment', 'false');
    this._session = this.getApplePaySessionObject();
    this._onValidateMerchantRequest();
    this._subscribeStatusHandlers();
    this._onPaymentAuthorized();
    this._onPaymentCanceled();
    this._session.begin();
  }

  /**
   * Sets Apple Pay button and begins Apple Pay flow.
   * @private
   */
  private _applePayProcess() {
    if (ApplePaySession) {
      alert('session');
      if (this.isUserLoggedToAppleAccount()) {
        alert('logged');
        this.checkApplePayWalletCardAvailability().then((canMakePayments: boolean) => {
          if (canMakePayments) {
            alert('can make payments');
            this._applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
            GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');
          } else {
            alert('cannot make payments');
          }
        });
      } else {
        document.getElementById(ApplePay.APPLE_PAY_BUTTON_ID).addEventListener('click', () => {
          alert('notlogged');
          this._notification.error(Language.translations.APPLE_PAY_NOT_LOGGED, true);
        });
      }
    }
  }

  /**
   * Handles errors during ApplePay process.
   * @param errorObject
   * @private
   */
  private _handleApplePayError(errorObject: any) {
    const { errorcode } = errorObject;
    if (this._ifBrowserSupportsApplePayVersion(this.applePayVersion)) {
      if (errorcode !== '0') {
        const { errormessage } = errorObject;
        let errordata = String(errorObject.data); // not sure this line - I can't force ApplePay to throw such error.
        const error = new ApplePayError('unknown');
        error.message = this._translator.translate(errormessage);
        if (errorcode === '30000') {
          if (errordata.lastIndexOf('billing', 0) === 0) {
            error.code = 'billingContactInvalid';
            errordata = errordata.slice(7);
          } else if (errordata.lastIndexOf('customer', 0) === 0) {
            error.code = 'shippingContactInvalid';
            errordata = errordata.slice(8);
          }
          if (typeof ApplePayContactMap[errordata] !== 'undefined') {
            error.contactField = ApplePayContactMap[errordata];
          } else if (error.code !== 'unknown') {
            error.code = 'addressUnserviceable';
          }
        }
        if (error.code !== 'unknown') {
          // @ts-ignore
          this._completion.errors = [error];
        }
      }
    }

    if (errorcode === '0') {
      this._completion.status = this.getPaymentSuccessStatus();
    } else {
      this._completion.status = this.getPaymentFailureStatus();
    }
    return this._completion;
  }

  /**
   * Chooses and triggers proper notification after payment.
   * @param errorcode
   * @private
   */
  private _displayNotification(errorcode: string) {
    errorcode === '0'
      ? this._notification.success(Language.translations.PAYMENT_SUCCESS, true)
      : this._notification.error(Language.translations.PAYMENT_ERROR, true);
  }
}

export default ApplePay;

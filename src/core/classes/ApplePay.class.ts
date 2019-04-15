import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import Language from './../shared/Language';
import DomMethods from './../shared/DomMethods';
import StTransport from './../classes/StTransport.class';

const ApplePaySession = (window as any).ApplePaySession;

/**
 * Sets Apple pay APM
 * Apple Pay flow:
 * 1. Checks if ApplePaySession class exists.
 * 2. Call canMakePayments() method to verify the device is capable of making Apple Pay payments.
 * 3. Call canMakePaymentsWithActiveCard(merchantID) to check if there is at least one card in Wallet.
 * 4. Display Apple Pay button.
 * 5. Construct ApplePaySession with versionNumber and ApplePayPaymentRequest as arguments.
 * 6. Call begin() method to display the payment sheet to the customer and initiate the merchant validation process.
 * 7. In onvalidatemerchant handler catch object to pass to completeMerchantValidation
 * 8. Handle customer's selections in the payment sheet to complete transaction cost - event handlers: onpaymentmethodselected, onshippingmethodselected, and onshippingcontactselected.
 * 9. 30 seconds to handle each event before the payment sheet times out: completePaymentMethodSelection, completeShippingMethodSelection, and completeShippingContactSelection
 * 10. Make request call WALLETVERIFY to ST just like in Cardinal Commerce.
 */
class ApplePay {
  set jwt(value: string) {
    this._jwt = value;
  }

  get jwt(): string {
    return this._jwt;
  }

  public applePayVersion: number;
  public paymentRequest: any;
  public merchantId: string;
  public sitereference: string;
  public sitesecurity: string;
  public stJwtInstance: StJwt;
  public placement: string;
  public buttonText: string;
  public buttonStyle: string;
  public session: any;
  public requiredBillingContactFields: [];
  public requiredShippingContactFields: [];

  public static APPLE_PAY_BUTTON_ID: string = 'st-apple-pay';
  public static APPLE_PAY_MIN_VERSION: number = 2;
  public static APPLE_PAY_MAX_VERSION: number = 5;
  public static APPLE_PAY_VERSIONS: number[] = [ApplePay.APPLE_PAY_MIN_VERSION, 3, 4, ApplePay.APPLE_PAY_MAX_VERSION];
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
  public static VERSION_4_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat([
    'cartesBancaires',
    'eftpos',
    'electron',
    'maestro',
    'vPay'
  ]);
  public static VERSION_5_SUPPORTED_NETWORKS = ApplePay.BASIC_SUPPORTED_NETWORKS.concat(['elo', 'mada']);
  private _jwt: string;
  private _applePayButtonProps: any = {};

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
    this.requiredShippingContactFields = paymentRequest.requiredShippingContactFields;
    this.requiredBillingContactFields = paymentRequest.requiredBillingContactFields;
    this.validateMerchantRequestData.walletmerchantid = merchantId;
    this.stJwtInstance = new StJwt(jwt);
    this._onInit(buttonText, buttonStyle);
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
      this.paymentRequest.supportedNetworks = ApplePay.VERSION_4_SUPPORTED_NETWORKS;
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
   * Simple handler for generated Apple Pay button
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
    }
    return this.paymentRequest;
  }

  /**
   *
   * @param buttonText
   * @param buttonStyle
   * @private
   */
  private _onInit(buttonText: string, buttonStyle: string) {
    if (this.ifApplePayIsAvailable()) {
      this.setApplePayVersion();
      this.setSupportedNetworks();
      this.setAmountAndCurrency();
      this.setApplePayButtonProps(buttonText, buttonStyle);
      this.addApplePayButton();
      this.applePayFlow();
    } else {
      alert('Apple Pay is not available on your device');
      // this.setNotification('ERROR', Language.translations.APPLE_PAYMENT_IS_NOT_AVAILABLE);
    }
  }

  /**
   * Make a server-to-server call to pass a payload to the Apple Pay validationURL endpoint.
   * If successful, Apple Pay servers will return a merchant session object which will be used in response to completeMerchantValidation
   */
  public onValidateMerchantRequest() {
    this.session.onvalidatemerchant = (event: any) => {
      this.validateMerchantRequestData.walletvalidationurl = event.validationURL;
      const stt = new StTransport({ jwt: this.jwt });
      stt
        .sendRequest(this.validateMerchantRequestData)
        .then(response => {
          console.log(`Send request succeded:`);
          console.log(response);
          this.onValidateMerchantResponseSuccess(response);
        })
        .catch(error => {
          console.log(`Send request catched:`);
          console.log(error);
          this.onValidateMerchantResponseFailure(error);
        });
    };
  }

  /**
   *
   */
  public onPaymentAuthorized() {
    this.session.onpaymentauthorized = (event: any) => {
      console.log(`onpaymentauthorized event:`);
      console.log(event);
      this.session.completePayment({ status: ApplePaySession.STATUS_SUCCESS, errors: [] });
    };
  }

  /**
   *
   */
  public onPaymentCanceled() {
    this.session.oncancel = (event: any) => {
      // this.setNotification('ERROR', 'Payment has been canceled');
      console.log(`oncancel event:`);
      console.log(event);
    };
  }

  /**
   *
   * @param response
   */
  public onValidateMerchantResponseSuccess(response: any) {
    const { walletsession } = response;
    if (walletsession) {
      const json = JSON.parse(walletsession);
      console.log(`walletsession ready object:`);
      console.log(json);
      this.session.completeMerchantValidation(json);
    } else {
      this.onValidateMerchantResponseFailure(response.requestid);
    }
  }

  /**
   *
   * @param error
   */
  public onValidateMerchantResponseFailure(error: any) {
    console.log(`onValidateMerchantResponseFailure:`);
    console.log(error);
  }

  /**
   * Sets payment sheet interactions handlers: onpaymentmethodselected, onshippingmethodselected, onshippingcontactselected
   * @param session
   */
  public subscribeStatusHandlers() {
    this.session.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      console.log(`onpaymentmethodselected event:`);
      console.log(event);
      console.log(paymentMethod);
      this.session.completePaymentMethodSelection({
        newTotal: { label: 'Free Shipping', amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };

    this.session.onshippingmethodselected = (event: any) => {
      const { paymentMethod } = event;
      console.log(`onshippingmethodselected event:`);
      console.log(paymentMethod);
      console.log(event);
      this.session.completeShippingMethodSelection({
        newTotal: { label: 'Free Shipping', amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };

    this.session.onshippingcontactselected = (event: any) => {
      const { shippingContact } = event;
      console.log(`onshippingcontactselected event: `);
      console.log(...shippingContact);
      this.session.completeShippingContactSelection({
        newTotal: { label: 'Free Shipping', amount: this.paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  /**
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  public setNotification(type: string, content: string) {
    DomMethods.getIframeContentWindow
      .call(this, Selectors.NOTIFICATION_FRAME_IFRAME)
      .postMessage({ type, content }, (window as any).frames[Selectors.NOTIFICATION_FRAME_IFRAME]);
  }

  /**
   * Begins Apple Pay payment flow.
   */
  public paymentProcess() {
    this.session = this.getApplePaySessionObject();
    // begins merchant validate process
    this.session.begin();
    this.onValidateMerchantRequest();
    this.subscribeStatusHandlers();
    this.onPaymentAuthorized();
    this.onPaymentCanceled();
  }

  /**
   * Sets Apple Pay button and begins Apple Pay flow
   */
  public applePayFlow() {
    if (this.checkApplePayAvailability()) {
      this.checkApplePayWalletCardAvailability().then((canMakePayments: boolean) => {
        if (canMakePayments) {
          this.applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
        } else {
          console.log('Cannot make payments');
          //this.setNotification('ERROR', Language.translations.APPLE_PAYMENT_IS_NOT_AVAILABLE);
        }
      });
    } else {
      console.log('Dont have cards');
      // this.setNotification('ERROR', Language.translations.APPLE_PAYMENT_IS_NOT_AVAILABLE);
    }
  }
}

export default ApplePay;

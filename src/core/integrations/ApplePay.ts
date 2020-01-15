import { StTransport } from '../classes/StTransport.class';
import { IWalletConfig } from '../models/Config';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Notification } from '../shared/Notification';
import { Payment } from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import { GoogleAnalytics } from './GoogleAnalytics';

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
    config.requestTypes = config.requestTypes !== undefined ? config.requestTypes : ['AUTH'];
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

  protected ifApplePayIsAvailable() {
    return !!ApplePaySession;
  }

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

  protected createApplePayButton() {
    return DomMethods.createHtmlElement.apply(this, [this._applePayButtonProps, 'div']);
  }

  protected isUserLoggedToAppleAccount(): boolean {
    return ApplePaySession.canMakePayments();
  }

  protected checkApplePayWalletCardAvailability() {
    return ApplePaySession.canMakePaymentsWithActiveCard(this._merchantId);
  }

  protected getApplePaySessionObject() {
    return new ApplePaySession(this.applePayVersion, this._paymentRequest);
  }

  protected getPaymentSuccessStatus() {
    return ApplePaySession.STATUS_SUCCESS;
  }

  protected getPaymentFailureStatus() {
    return ApplePaySession.STATUS_FAILURE;
  }

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

  private _setSupportedNetworks() {
    let supportedNetworks;
    if (this.applePayVersion <= ApplePay.APPLE_PAY_MIN_VERSION) {
      supportedNetworks = ApplePay.BASIC_SUPPORTED_NETWORKS;
    } else if (
      this.applePayVersion > ApplePay.APPLE_PAY_MIN_VERSION &&
      this.applePayVersion < ApplePay.APPLE_PAY_MAX_VERSION
    ) {
      supportedNetworks = ApplePay.VERSION_4_SUPPORTED_NETWORKS;
    } else {
      supportedNetworks = ApplePay.VERSION_5_SUPPORTED_NETWORKS;
    }
    if (this._paymentRequest.supportedNetworks.length > 0) {
      const userDefinedSupportedNetworks: string[] = [];
      let i;
      for (i in supportedNetworks) {
        if (this._paymentRequest.supportedNetworks.indexOf(supportedNetworks[i]) !== -1) {
          userDefinedSupportedNetworks.push(supportedNetworks[i]);
        }
      }
      this._paymentRequest.supportedNetworks = userDefinedSupportedNetworks;
    } else {
      this._paymentRequest.supportedNetworks = supportedNetworks;
    }
  }

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

  private _addApplePayButton = () => DomMethods.appendChildIntoDOM(this._placement, this.createApplePayButton());

  private _ifApplePayButtonTextIsValid = (buttonText: string) => ApplePay.AVAILABLE_BUTTON_TEXTS.includes(buttonText);

  private _ifApplePayButtonStyleIsValid = (buttonStyle: string) =>
    ApplePay.AVAILABLE_BUTTON_STYLES.includes(buttonStyle);

  private _applePayButtonClickHandler = (elementId: string, event: string) => {
    document.getElementById(elementId).addEventListener(event, () => {
      this._paymentProcess();
    });
  };

  private _setAmountAndCurrency() {
    if (this._paymentRequest.total.amount && this._paymentRequest.currencyCode) {
      this._paymentRequest.total.amount = this._stJwtInstance.mainamount;
      this._paymentRequest.currencyCode = this._stJwtInstance.currencyiso3a;
    } else {
      this._notification.error(Language.translations.APPLE_PAY_AMOUNT_AND_CURRENCY, true);
    }
    return this._paymentRequest;
  }

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

  private _onValidateMerchantRequest() {
    this._session.onvalidatemerchant = (event: any) => {
      this._validateMerchantRequestData.walletvalidationurl = event.validationURL;
      this._validateMerchantRequestData.walletmerchantid = this._merchantId;
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

  private _ifBrowserSupportsApplePayVersion = (version: number) => {
    return ApplePaySession.supportsVersion(version);
  };

  private _onPaymentCanceled() {
    this._session.oncancel = (event: any) => {
      this._notification.warning(Language.translations.PAYMENT_CANCELLED, true);
      GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    };
  }

  private _onValidateMerchantResponseSuccess(response: any) {
    const { requestid, walletsession } = response;
    if (walletsession) {
      this._merchantSession = JSON.parse(walletsession);
      this._session.completeMerchantValidation(this._merchantSession);
    } else {
      this._onValidateMerchantResponseFailure(requestid);
    }
  }

  private _onValidateMerchantResponseFailure(error: any) {
    this._session.abort();
    this._notification.error(Language.translations.MERCHANT_VALIDATION_FAILURE, true);
  }

  private _subscribeStatusHandlers() {
    this._session.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this._session.completePaymentMethodSelection({
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

  private _paymentProcess() {
    localStorage.setItem('completePayment', 'false');
    this._session = this.getApplePaySessionObject();
    this._onValidateMerchantRequest();
    this._subscribeStatusHandlers();
    this._onPaymentAuthorized();
    this._onPaymentCanceled();
    this._session.begin();
  }

  private _applePayProcess() {
    if (ApplePaySession) {
      if (this.isUserLoggedToAppleAccount()) {
        this.checkApplePayWalletCardAvailability().then(() => {
          this._applePayButtonClickHandler(ApplePay.APPLE_PAY_BUTTON_ID, 'click');
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');
        });
      } else {
        this._addButtonHandler(
          ApplePay.APPLE_PAY_BUTTON_ID,
          'click',
          'error',
          Language.translations.APPLE_PAY_NOT_LOGGED
        );
      }
    }
  }

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

  private _displayNotification(errorcode: string) {
    errorcode === '0'
      ? this._notification.success(Language.translations.PAYMENT_SUCCESS, true)
      : this._notification.error(Language.translations.PAYMENT_ERROR, true);
  }

  private _addButtonHandler(id: string, event: string, notification: string, message: string) {
    const element: HTMLButtonElement = document.getElementById(id) as HTMLButtonElement;
    const eventType: string = event ? event : 'click';
    const notificationType: string = notification;
    if (element) {
      element.addEventListener(eventType, () => {
        if (notificationType === 'success') {
          this._notification.success(message, true);
        } else if (notificationType === 'error') {
          this._notification.error(message, true);
        } else if (notificationType === 'warning') {
          this._notification.warning(message, true);
        } else {
          this._notification.info(message, true);
        }
      });
    } else {
      return false;
    }
  }
}

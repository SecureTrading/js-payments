import { StTransport } from '../services/StTransport.class';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Payment } from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import { GoogleAnalytics } from './GoogleAnalytics';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Container } from 'typedi';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { ConfigProvider } from '../services/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IApplePay } from '../models/IApplePay';

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
  private _messageBus: MessageBus;
  private _session: any;
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
  private _notification: NotificationService;
  private _requestTypes: string[];
  private _translator: Translator;
  private _merchantId: string;
  private _paymentRequest: any;
  private _placement: string;
  private _completion: { errors: []; status: string };
  private _localStorage: BrowserLocalStorage;
  private readonly _config$: Observable<IConfig>;
  private _applePayConfig: IApplePay;
  private _datacenterurl: string;
  private _formId: string;
  private _paymentCancelled: boolean = false;

  constructor(private _configProvider: ConfigProvider, private _communicator: InterFrameCommunicator) {
    this._notification = Container.get(NotificationService);
    this._messageBus = Container.get(MessageBus);
    this._localStorage = Container.get(BrowserLocalStorage);

    this._config$ = this._configProvider.getConfig$();

    this._config$.subscribe(config => {
      const { applePay, jwt, datacenterurl, formId } = config;
      if (applePay) {
        // @ts-ignore
        this._applePayConfig = applePay;
      }
      this.jwt = jwt;
      this._formId = formId;
      this._datacenterurl = datacenterurl;
      this._onInit(this._applePayConfig.buttonText, this._applePayConfig.buttonStyle);
    });
    this._localStorage.setItem('completePayment', '');
    this._completion = {
      errors: [],
      status: ApplePaySession ? this.getPaymentSuccessStatus() : ''
    };

    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { newJwt } = data;
      this._configurePaymentProcess(newJwt);
      this._setAmountAndCurrency();
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
    return DomMethods.createHtmlElement.apply(this, [this._applePayButtonProps, 'a']);
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

  private _configurePaymentProcess(jwt: string) {
    const { placement, paymentRequest, merchantId } = this._applePayConfig;
    this._merchantId = merchantId;
    this._placement = placement;
    this.payment = new Payment();
    this._paymentRequest = paymentRequest;
    this._requestTypes = paymentRequest.requestTypes;
    this._validateMerchantRequestData.walletmerchantid = merchantId;
    this._stJwtInstance = new StJwt(jwt);
    this._stTransportInstance = Container.get(StTransport);
    this._translator = new Translator(this._stJwtInstance.locale);
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
    this._applePayButtonProps.style = `-webkit-appearance: -apple-pay-button;-apple-pay-button-type: ${this._buttonText};-apple-pay-button-style: ${this._buttonStyle};pointer-events: auto;cursor: pointer;display: flex;role: button;`;
  }

  private _addApplePayButton = () => DomMethods.appendChildIntoDOM(this._placement, this.createApplePayButton());

  private _ifApplePayButtonTextIsValid = (buttonText: string) => ApplePay.AVAILABLE_BUTTON_TEXTS.includes(buttonText);

  private _ifApplePayButtonStyleIsValid = (buttonStyle: string) =>
    ApplePay.AVAILABLE_BUTTON_STYLES.includes(buttonStyle);

  private _applePayButtonClickHandler() {
    const button = document.getElementById(ApplePay.APPLE_PAY_BUTTON_ID);
    const handler = () => {
      this._paymentProcess();
      button.removeEventListener('click', handler);
    };
    button.addEventListener('click', handler);
  }

  private _setAmountAndCurrency() {
    if (this._paymentRequest.total.amount && this._paymentRequest.currencyCode) {
      this._paymentRequest.total.amount = this._stJwtInstance.mainamount;
      this._paymentRequest.currencyCode = this._stJwtInstance.currencyiso3a;
    } else {
      this._notification.error(Language.translations.APPLE_PAY_AMOUNT_AND_CURRENCY);
    }
    return this._paymentRequest;
  }

  private _onInit(buttonText: string, buttonStyle: string) {
    if (this.ifApplePayIsAvailable()) {
      this._configurePaymentProcess(this.jwt);
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
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
          return this._onValidateMerchantResponseSuccess(response);
        })
        .catch(error => {
          if (this._paymentCancelled) {
            return;
          }
          const { errorcode, errormessage } = error;
          this._onValidateMerchantResponseFailure(error);
          this._applePayButtonClickHandler();
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
          this._notification.error(`${errorcode}: ${errormessage}`);
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
          DomMethods.parseForm(this._formId)
        )
        .then((response: any) => {
          const { errorcode, errormessage } = response.response;
          this._handleApplePayError(response.response);
          this._session.completePayment(this._completion);
          this._displayNotification(errorcode, errormessage);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
          this._localStorage.setItem('completePayment', 'true');
        })
        .catch(() => {
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
          this._notification.error(Language.translations.PAYMENT_ERROR);
          this._session.completePayment({ status: this.getPaymentFailureStatus(), errors: [] });
          this._applePayButtonClickHandler();
          this._localStorage.setItem('completePayment', 'true');
        });
    };
  }

  private _ifBrowserSupportsApplePayVersion = (version: number) => {
    return ApplePaySession.supportsVersion(version);
  };

  private _onPaymentCanceled() {
    this._session.oncancel = (event: any) => {
      this._paymentCancelled = true;
      this._notification.cancel(Language.translations.PAYMENT_CANCELLED);
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
      this._messageBus.publish(
        {
          type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE,
          data: { errorcode: 'cancelled' }
        },
        true
      );
      this._applePayButtonClickHandler();
      GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    };
  }

  private _onValidateMerchantResponseSuccess(response: any): Promise<any> {
    const { requestid, walletsession } = response;
    if (this._paymentCancelled) {
      return Promise.reject(requestid);
    }
    return new Promise((resolve, reject) => {
      if (walletsession) {
        try {
          this._session.completeMerchantValidation(JSON.parse(walletsession));
          resolve();
        } catch (error) {
          console.warn(error);
          reject(requestid);
        }
      } else {
        reject(requestid);
      }
    });
  }

  private _onValidateMerchantResponseFailure(error: any) {
    try {
      this._session.abort();
    } catch (error) {
      console.warn(error);
    }
    this._notification.error(Language.translations.MERCHANT_VALIDATION_FAILURE);
  }

  private _subscribeStatusHandlers() {
    this._session.onpaymentmethodselected = (event: any) => {
      this._session.completePaymentMethodSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };

    this._session.onshippingmethodselected = (event: any) => {
      this._session.completeShippingMethodSelection({
        newTotal: { label: this._paymentRequest.total.label, amount: this._paymentRequest.total.amount, type: 'final' }
      });
    };

    this._session.onshippingcontactselected = (event: any) => {
      this._session.completeShippingContactSelection({
        newTotal: { label: this._paymentRequest.total.label, amount: this._paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  private _paymentProcess() {
    this._paymentCancelled = false;
    this._localStorage.setItem('completePayment', 'false');
    this._session = this.getApplePaySessionObject();
    this._onPaymentCanceled();
    this._subscribeStatusHandlers();
    this._onPaymentAuthorized();
    this._onValidateMerchantRequest();
    try {
      this._session.begin();
    } catch (error) {
      console.warn(error);
    }
  }

  private _applePayProcess() {
    if (ApplePaySession) {
      if (this.isUserLoggedToAppleAccount()) {
        this.checkApplePayWalletCardAvailability().then(() => {
          this._applePayButtonClickHandler();
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
      this._applePayButtonClickHandler();
      this._completion.status = this.getPaymentFailureStatus();
    }

    return this._completion;
  }

  private _displayNotification(errorcode: string, errormessage: string) {
    if (errorcode === '0') {
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
      this._notification.success(Language.translations.PAYMENT_SUCCESS);
    } else {
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
      this._notification.error(errormessage);
    }
  }

  private _addButtonHandler(id: string, event: string, notification: string, message: string) {
    const element: HTMLButtonElement = document.getElementById(id) as HTMLButtonElement;
    const eventType: string = event ? event : 'click';
    const notificationType: string = notification;
    if (element) {
      element.addEventListener(eventType, () => {
        if (notificationType === 'success') {
          this._notification.success(message);
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        } else if (notificationType === 'error') {
          this._notification.error(message);
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        } else if (notificationType === 'cancel') {
          this._notification.cancel(message);
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
        } else {
          this._notification.info(message);
        }
      });
    } else {
      return false;
    }
  }
}

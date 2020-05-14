import { StTransport } from '../services/StTransport.class';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Payment } from '../shared/Payment';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import { GoogleAnalytics } from './GoogleAnalytics';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { ConfigProvider } from '../services/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { APPLE_PAY_BUTTON_ID } from '../models/constants/apple-pay/ButtonProperties';
import {
  STAGE_ONE_NETWORKS,
  STAGE_TWO_NETWORKS,
  STAGE_THREE_NETWORKS
} from '../models/constants/apple-pay/SupportedNetworks';
import { IValidateMerchantRequest } from '../models/apple-pay/IValidateMerchantRequest';
import { IPaymentRequest } from '../models/apple-pay/IPaymentRequest';
import { IApplePayPaymentAuthorizationResult } from '../models/apple-pay/IApplePayPaymentAuthorizationResult ';
import { IApplePayValidateMerchantEvent } from '../models/apple-pay/IApplePayValidateMerchantEvent';

const ApplePaySession = (window as any).ApplePaySession;
const ApplePayError = (window as any).ApplePayError;

/**
 * Apple Pay flow:
 * 1. Check if ApplePaySession class exists
 *    (it must be iOS 10 and later and macOS 10.12 and later).
 * 2. Call setApplePayVersion() to set latest available ApplePaySchema version.
 * 3. Call setSupportedNetworks() to set available networks which are supported
 *    in this particular version of Apple Pay.
 * 4. Call setAmountAndCurrency() to set amount and currency hidden in provided JWT.
 * 5. Call _createButton(), _setApplePayButtonProps() and addApplePayButton)
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
  private _applePaySession: any;
  private _validateMerchantRequest: IValidateMerchantRequest;
  private _payment: Payment;
  private _translator: Translator;
  private _paymentRequest: IPaymentRequest;
  private readonly _completion: IApplePayPaymentAuthorizationResult;
  private readonly _config$: Observable<IConfig>;

  constructor(
    private _communicator: InterFrameCommunicator,
    private _configProvider: ConfigProvider,
    private _localStorage: BrowserLocalStorage,
    private _messageBus: MessageBus,
    private _notification: NotificationService,
    private _stTransport: StTransport
  ) {
    if (!Boolean(ApplePaySession)) {
      throw new Error('Works only on Safari');
    }

    this._completion = {
      errors: [],
      status: ''
    };

    this._validateMerchantRequest = {
      walletmerchantid: '',
      walletrequestdomain: window.location.hostname,
      walletsource: 'APPLEPAY',
      walletvalidationurl: ''
    };

    this._config$ = this._configProvider.getConfig$();
  }

  public init(): void {
    this._config$.subscribe((config: IConfig) => {
      const { applePay, jwt } = config;
      const { buttonStyle, buttonText, merchantId, paymentRequest, placement, requestTypes } = applePay;
      const { currencyiso3a, locale, mainamount } = new StJwt(jwt);
      const applePayVersion: number = this._latestSupportedApplePayVersion();
      this._canMakePayments();
      this._setConfig(applePayVersion, currencyiso3a, locale, merchantId, mainamount, paymentRequest, requestTypes);
      this._insertButton(placement, buttonText, buttonStyle, locale);
      this._hasActiveCards(merchantId, applePayVersion);
    });
    this._subscribeUpdateJwt();
  }

  private _setConfig(
    applePayVersion: number,
    currencyiso3a: string,
    locale: string,
    merchantId: string,
    mainamount: string,
    paymentRequest: IPaymentRequest,
    requestTypes: string[]
  ): void {
    this._translator = new Translator(locale);
    this._payment = new Payment();
    this._setMerchantId(merchantId);
    this._setPaymentRequest(paymentRequest, requestTypes);
    this._setSupportedNetworks(this._getSupportedNetworks(applePayVersion));
    this._setCurrencyCode(currencyiso3a);
    this._setAmount(mainamount);
  }

  private _subscribeUpdateJwt(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { currencyiso3a, locale, mainamount } = new StJwt(data.newJwt);
      this._translator = new Translator(locale);
      this._setCurrencyCode(currencyiso3a);
      this._setAmount(mainamount);
    });
  }

  private _createButton(buttonText: string, buttonStyle: string, locale: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        style: `-webkit-appearance: -apple-pay-button;
                -apple-pay-button-type: ${buttonText};
                -apple-pay-button-style: ${buttonStyle}`
      },
      {
        lang: locale
      },
      'div'
    ]);
  }

  private _insertButton(placement: string, buttonText: string, buttonStyle: string, locale: string): Element {
    return DomMethods.appendChildIntoDOM(placement, this._createButton(buttonText, buttonStyle, locale));
  }

  private _getSupportedNetworks(version: number): string[] {
    const stageOneVersions: number[] = [1, 2, 3];
    const stageTwoVersions: number[] = [4];
    const stageThreeVersions: number[] = [5, 6];

    if (stageOneVersions.includes(version)) {
      return STAGE_ONE_NETWORKS;
    }

    if (stageTwoVersions.includes(version)) {
      return STAGE_TWO_NETWORKS;
    }

    if (stageThreeVersions.includes(version)) {
      return STAGE_THREE_NETWORKS;
    }
  }

  private _setSupportedNetworks(networks: string[]): void {
    this._paymentRequest.supportedNetworks = networks.filter((item: string) => {
      return this._paymentRequest.supportedNetworks.includes(item);
    });
  }

  private _setCurrencyCode(currencyCode: string): void {
    this._paymentRequest.currencyCode = currencyCode;
  }

  private _setAmount(amount: string): void {
    this._paymentRequest.total.amount = amount;
  }

  private _setMerchantId(merchantId: string): void {
    this._validateMerchantRequest.walletmerchantid = merchantId;
  }

  private _setPaymentRequest(paymentRequest: any, requestTypes: any): void {
    this._paymentRequest = { ...paymentRequest, ...requestTypes };
  }

  private _setValidationUrl(url: string): void {
    this._validateMerchantRequest.walletvalidationurl = url;
  }

  private _onValidateMerchant() {
    this._applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this._setValidationUrl(event.validationURL);

      return this._payment
        .walletVerify(this._validateMerchantRequest)
        .then(({ response }: any) => {
          this._onValidateMerchantResponseSuccess(response);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'merchant validation', 'Apple Pay merchant validated');
        })
        .catch(error => {
          const { errorcode, errormessage } = error;
          this._onValidateMerchantResponseFailure(error);
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
    this._applePaySession.onpaymentauthorized = (event: any) => {
      return this._payment
        .processPayment(
          this._paymentRequest.requestTypes,
          {
            walletsource: this._validateMerchantRequest.walletsource,
            wallettoken: JSON.stringify(event.payment)
          },
          DomMethods.parseForm()
        )
        .then((response: any) => {
          this._handleApplePayError(response.response);
          this._applePaySession.completePayment(this._completion);
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
          this._localStorage.setItem('completePayment', 'true');
          const { errorcode, errormessage } = response.response;
          this._displayNotification(errorcode, errormessage);
        })
        .catch(() => {
          this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
          this._notification.error(Language.translations.PAYMENT_ERROR);
          this._applePaySession.completePayment({ status: ApplePaySession.STATUS_FAILURE, errors: [] });
          this._localStorage.setItem('completePayment', 'true');
        });
    };
  }

  private _latestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();
    console.error(versions);
    return versions.find((version: number) => {
      console.error(version);
      return ApplePaySession.supportsVersion(version);
    });
  }

  private _onCancel(): void {
    this._applePaySession.oncancel = (event: any) => {
      this._notification.cancel(Language.translations.PAYMENT_CANCELLED);
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
      this._messageBus.publish(
        { type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, data: { errorcode: event } },
        true
      );
      GoogleAnalytics.sendGaData('event', 'Apple Pay', 'payment status', 'Apple Pay payment cancelled');
    };
  }

  private _onValidateMerchantResponseSuccess(response: any) {
    const { requestid, walletsession } = response;

    if (!Boolean(walletsession)) {
      this._onValidateMerchantResponseFailure(requestid);
      return;
    }

    this._applePaySession.completeMerchantValidation(JSON.parse(walletsession));
  }

  private _onValidateMerchantResponseFailure(error: any) {
    this._applePaySession.abort();
    this._notification.error(Language.translations.MERCHANT_VALIDATION_FAILURE);
  }

  private _onPaymentMethodSelected(): void {
    this._applePaySession.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this._applePaySession.completePaymentMethodSelection({
        newTotal: {
          amount: this._paymentRequest.total.amount,
          label: this._paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private _onShippingMethodSelected(): void {
    this._applePaySession.onshippingmethodselected = (event: any) => {
      const { paymentMethod } = event;
      this._applePaySession.completeShippingMethodSelection({
        newTotal: { label: this._paymentRequest.total.label, amount: this._paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  private _onShippingContactSelected(): void {
    this._applePaySession.onshippingcontactselected = (event: any) => {
      const { shippingContact } = event;
      this._applePaySession.completeShippingContactSelection({
        newTotal: { label: this._paymentRequest.total.label, amount: this._paymentRequest.total.amount, type: 'final' }
      });
    };
  }

  private _proceedPayment(applePayVersion: string): void {
    this._applePaySession = new ApplePaySession(applePayVersion, this._paymentRequest); // must be here (gesture handler)
    this._onValidateMerchant();
    this._onPaymentMethodSelected();
    this._onShippingMethodSelected();
    this._onShippingContactSelected();
    this._onPaymentAuthorized();
    this._onCancel();
    this._applePaySession.begin();
  }

  private _canMakePayments(): void {
    if (!ApplePaySession.canMakePayments()) {
      throw new Error('Your device does not support making payments with Apple Pay');
    }
  }

  private _hasActiveCards(merchantId: string, applePayVersion: number): void {
    ApplePaySession.canMakePaymentsWithActiveCard(merchantId)
      .then((canMakePayments: boolean) => {
        if (canMakePayments) {
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');
          document.getElementById(APPLE_PAY_BUTTON_ID).addEventListener('click', () => {
            this._proceedPayment(applePayVersion);
          });
        } else {
          GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay cannot make payments');
          throw new Error('User has not an active card provisioned into Wallet');
        }
      })
      .catch(() => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(Language.translations.APPLE_PAY_NOT_LOGGED);
      });
  }

  private _handleApplePayError(errorObject: any) {
    const { errorcode, errormessage } = errorObject;
    console.error('Error Object: ', errorObject);

    if (!this._latestSupportedApplePayVersion()) {
      this._completion.status = ApplePaySession.STATUS_FAILURE;
      return this._completion;
    }

    if (errorcode === '0') {
      this._completion.status = ApplePaySession.STATUS_SUCCESS;
      return this._completion;
    }

    if (errorcode !== '0') {
      this._completion.status = ApplePaySession.STATUS_FAILURE;
      let errordata = String(errorObject.data); // not sure this line - I can't force ApplePaySchema to throw such error.
      const error = new ApplePayError('unknown');
      error.message = this._translator.translate(errormessage);
      this._localStorage.setItem('completePayment', 'false');

      if (errorcode !== '30000') {
        return;
      }

      if (errordata.lastIndexOf('billing', 0) === 0) {
        error.code = 'billingContactInvalid';
        errordata = errordata.slice(7);
        return;
      }

      if (errordata.lastIndexOf('customer', 0) === 0) {
        error.code = 'shippingContactInvalid';
        errordata = errordata.slice(8);
        return;
      }
    }
  }

  private _displayNotification(errorcode: string, errormessage: string) {
    if (errorcode === '0') {
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
      this._notification.success(Language.translations.PAYMENT_SUCCESS);
      return;
    }
    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    this._notification.error(errormessage);
  }
}

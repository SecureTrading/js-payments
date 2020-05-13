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

const ApplePaySession = (window as any).ApplePaySession;
const ApplePayError = (window as any).ApplePayError;

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
  private _applePayVersion: number;
  private _merchantSession: any;
  private _session: any;
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

    this._config$ = this._configProvider.getConfig$();
    this._config$.subscribe((config: IConfig) => {
      const { applePay, jwt } = config;
      const { buttonStyle, buttonText, merchantId, paymentRequest, placement, requestTypes } = applePay;
      const { currencyiso3a, locale, mainamount } = new StJwt(jwt);
      this._translator = new Translator(locale);
      this._validateMerchantRequest = {
        walletmerchantid: merchantId,
        walletrequestdomain: window.location.hostname,
        walletsource: 'APPLEPAY',
        walletvalidationurl: ''
      };
      this._paymentRequest = { ...paymentRequest, ...requestTypes };
      this._applePayVersion = this._latestSupportedApplePayVersion();
      this._paymentRequest.supportedNetworks = this._setSupportedNetworks(
        this._getSupportedNetworks(this._applePayVersion)
      );
      console.error(this._paymentRequest.supportedNetworks);
      this._setAmountAndCurrency(mainamount, currencyiso3a);
      this._session = new ApplePaySession(this._applePayVersion, this._paymentRequest);
      this._addApplePayButton(placement, buttonText, buttonStyle);
      this._applePayProcess(merchantId);
    });
    this._localStorage.setItem('completePayment', '');
    this._completion = {
      errors: [],
      status: ApplePaySession ? ApplePaySession.STATUS_SUCCESS : ''
    };

    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { currencyiso3a, locale, mainamount } = new StJwt(data.newJwt);
      this._translator = new Translator(locale);
      this._setAmountAndCurrency(mainamount, currencyiso3a);
    });
  }

  protected createApplePayButton(buttonText: string, buttonStyle: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        style: `-webkit-appearance: -apple-pay-button; -apple-pay-button-type: ${buttonText}; -apple-pay-button-style: ${buttonStyle}`
      },
      'div'
    ]);
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

  private _setSupportedNetworks(networks: string[]): string[] {
    return networks.filter((item: string) => {
      return this._paymentRequest.supportedNetworks.includes(item);
    });
  }

  private _addApplePayButton = (placement: string, buttonText: string, buttonStyle: string): Element => {
    return DomMethods.appendChildIntoDOM(placement, this.createApplePayButton(buttonText, buttonStyle));
  };

  private _setAmountAndCurrency(amount: string, currencyCode: string): void {
    this._paymentRequest.total.amount = amount;
    this._paymentRequest.currencyCode = currencyCode;
  }

  private _onValidateMerchantRequest() {
    this._session.onvalidatemerchant = (event: any) => {
      this._validateMerchantRequest.walletvalidationurl = event.validationURL;
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
    this._session.onpaymentauthorized = (event: any) => {
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
          this._session.completePayment({ status: ApplePaySession.STATUS_FAILURE, errors: [] });
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

  private _onPaymentCanceled() {
    this._session.oncancel = (event: any) => {
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
    if (walletsession) {
      this._merchantSession = JSON.parse(walletsession);
      this._session.completeMerchantValidation(this._merchantSession);
    } else {
      this._onValidateMerchantResponseFailure(requestid);
    }
  }

  private _onValidateMerchantResponseFailure(error: any) {
    this._session.abort();
    this._notification.error(Language.translations.MERCHANT_VALIDATION_FAILURE);
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
    this._payment = new Payment();
    this._onValidateMerchantRequest();
    this._subscribeStatusHandlers();
    this._onPaymentAuthorized();
    this._onPaymentCanceled();
    this._session.begin();
  }

  private _applePayProcess(merchantId: string): void {
    if (!ApplePaySession.canMakePayments()) {
      throw new Error('Cannot make payment');
    }

    ApplePaySession.canMakePaymentsWithActiveCard(merchantId).then(() => {
      GoogleAnalytics.sendGaData('event', 'Apple Pay', 'init', 'Apple Pay can make payments');
      document.getElementById(APPLE_PAY_BUTTON_ID).addEventListener('click', () => {
        this._paymentProcess();
      });
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
      let errordata = String(errorObject.data); // not sure this line - I can't force ApplePay to throw such error.
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
    } else {
      this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
      this._notification.error(errormessage);
    }
  }
}

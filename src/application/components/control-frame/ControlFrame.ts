import JwtDecode from 'jwt-decode';
import { StCodec } from '../../core/services/StCodec.class';
import { FormFieldsDetails } from '../../core/models/constants/FormFieldsDetails';
import { FormFieldsValidity } from '../../core/models/constants/FormFieldsValidity';
import { FormState } from '../../core/models/constants/FormState';
import { ICard } from '../../core/models/ICard';
import { IDecodedJwt } from '../../core/models/IDecodedJwt';
import { IFormFieldsDetails } from '../../core/models/IFormFieldsDetails';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IFormFieldsValidity } from '../../core/models/IFormFieldsValidity';
import { IMerchantData } from '../../core/models/IMerchantData';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { IResponseData } from '../../core/models/IResponseData';
import { ISubmitData } from '../../core/models/ISubmitData';
import { Frame } from '../../core/shared/Frame';
import { Language } from '../../core/shared/Language';
import { MessageBus } from '../../core/shared/MessageBus';
import { Payment } from '../../core/shared/Payment';
import { Validation } from '../../core/shared/Validation';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { BrowserSessionStorage } from '../../../shared/services/storage/BrowserSessionStorage';
import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ConfigProvider } from '../../core/services/ConfigProvider';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Cybertonica } from '../../core/integrations/Cybertonica';
import { IConfig } from '../../../shared/model/config/IConfig';
import { CardinalCommerce } from '../../core/integrations/CardinalCommerce';
import { ICardinalCommerceTokens } from '../../core/integrations/cardinal-commerce/ICardinalCommerceTokens';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IAuthorizePaymentResponse } from '../../core/models/IAuthorizePaymentResponse';

@Service()
export class ControlFrame extends Frame {
  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];
  private static NON_CVV_CARDS: string[] = ['PIBA'];
  private static THREEDQUERY_EVENT: string = 'THREEDQUERY';

  private static _setFormFieldValidity(field: IFormFieldState, data: IFormFieldState): void {
    field.validity = data.validity;
  }

  private static _setFormFieldValue(field: IFormFieldState, data: IFormFieldState): void {
    field.value = data.value;
  }

  private static _resetJwt(): void {
    StCodec.jwt = StCodec.originalJwt;
  }

  private static _updateJwt(jwt: string): void {
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
  }

  private _card: ICard = {
    pan: '',
    expirydate: '',
    securitycode: ''
  };
  private _isPaymentReady: boolean = false;
  private _formFields: IFormFieldsDetails = FormFieldsDetails;
  private _formFieldsValidity: IFormFieldsValidity = FormFieldsValidity;
  private _merchantFormData: IMerchantData;
  private _payment: Payment;
  private _postThreeDRequestTypes: string[];
  private _preThreeDRequestTypes: string[];
  private _threeDQueryResult: any;
  private _validation: Validation;

  constructor(
    private _localStorage: BrowserLocalStorage,
    private _sessionStorage: BrowserSessionStorage,
    private _communicator: InterFrameCommunicator,
    private _configProvider: ConfigProvider,
    private _notification: NotificationService,
    private _cybertonica: Cybertonica,
    private _cardinalCommerce: CardinalCommerce
  ) {
    super();
    const config$ = this._configProvider.getConfig$();
    this._communicator.whenReceive(MessageBus.EVENTS_PUBLIC.CONFIG_CHECK).thenRespond(() => config$);
    config$.subscribe(config => this.onInit(config));
  }

  protected async onInit(config: IConfig): Promise<void> {
    super.onInit();
    this._setInstances();
    this._setFormFieldsValidities();
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_CARD_NUMBER, this._formFields.cardNumber);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, this._formFields.expirationDate);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE, this._formFields.securityCode);
    this._setRequestTypes(config);
    this._processPaymentsEvent();
    this._submitFormEvent();
    this._updateMerchantFieldsEvent();
    this._resetJwtEvent();
    this._updateJwtEvent();
    this._initCybertonica(config);
    this._initCardinalCommerce(config);

    this.messageBus.subscribe(
      MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
      (tokens: ICardinalCommerceTokens) => {
        this._payment.setCardinalCommerceCacheToken(tokens.cacheToken);
      }
    );
  }

  protected getAllowedParams(): string[] {
    return super.getAllowedParams().concat(ControlFrame.ALLOWED_PARAMS);
  }

  private _formFieldChangeEvent(event: string, field: IFormFieldState): void {
    this.messageBus.subscribe(event, (data: IFormFieldState) => {
      this._formFieldChange(event, data.value);
      ControlFrame._setFormFieldValidity(field, data);
      ControlFrame._setFormFieldValue(field, data);
    });
  }

  private _processPaymentsEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS, (data: IResponseData) => {
      this._onProcessPayments(data);
    });
  }

  private _resetJwtEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.RESET_JWT, () => {
      ControlFrame._resetJwt();
    });
  }

  private _setRequestTypes(config: IConfig): void {
    const requestTypes = config.components.requestTypes;
    const threeDIndex = requestTypes.indexOf(ControlFrame.THREEDQUERY_EVENT);
    this._preThreeDRequestTypes = requestTypes.slice(0, threeDIndex + 1);
    this._postThreeDRequestTypes = requestTypes.slice(threeDIndex + 1, requestTypes.length);
  }

  private _updateJwtEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: any) => {
      ControlFrame._updateJwt(data.newJwt);
    });
  }

  private _updateMerchantFieldsEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: IMerchantData) => {
      this._updateMerchantFields(data);
    });
  }

  private _submitFormEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: ISubmitData) => {
      const isPanPiba: boolean = this._isCardWithoutCVV();
      const dataInJwt = data ? data.dataInJwt : false;
      const deferInit = data ? data.deferInit : false;
      const { validity } = this._validation.formValidation(
        dataInJwt,
        deferInit,
        data.fieldsToSubmit,
        this._formFields,
        isPanPiba,
        this._isPaymentReady
      );
      if (!validity) {
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._validateFormFields();
        return;
      }

      if (this._isCardBypassed(data)) {
        this._bypassCard();
        return;
      }

      this._callThreeDQueryRequest().subscribe(authorizationData => this._processPayment(authorizationData as any));
    });
  }

  private _bypassCard() {
    const { pan, expirydate, securitycode } = this._card;
    const postData: any = {
      expirydate,
      pan,
      securitycode
    };
    this.messageBus.publish({
      data: postData,
      type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
    });
  }

  private _isCardBypassed(data: ISubmitData): boolean {
    return !this._card.pan
      ? data.bypassCards.includes(iinLookup.lookup(this._getPan()).type)
      : data.bypassCards.includes(iinLookup.lookup(this._card.pan).type);
  }

  private _isThreeDRequestCalled(): boolean {
    return this._postThreeDRequestTypes.length !== 0;
  }

  private _onProcessPayments(data: IResponseData): void {
    if (this._isThreeDRequestCalled()) {
      this._processPayment(data);
      return;
    }
    this._threeDResponse(data);
  }

  private _threeDResponse(data: IResponseData): void {
    if (data.threedresponse !== undefined) {
      StCodec.publishResponse(this._threeDQueryResult.response, this._threeDQueryResult.jwt, data.threedresponse);
    }
    this._notification.success(Language.translations.PAYMENT_SUCCESS);
  }

  private _processPayment(data: IResponseData): void {
    this._payment
      .processPayment(this._postThreeDRequestTypes, this._card, this._merchantFormData, data)
      .then(() => {
        this.messageBus.publish(
          {
            type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK
          },
          true
        );
        this._notification.success(Language.translations.PAYMENT_SUCCESS);
        this._validation.blockForm(FormState.COMPLETE);
      })
      .catch((error: any) => {
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(Language.translations.PAYMENT_ERROR);
        this._validation.blockForm(FormState.AVAILABLE);
      })
      .finally(() => {
        ControlFrame._resetJwt();
      });
  }

  private _isCardWithoutCVV(): boolean {
    const panFromJwt: string = this._getPan();
    let pan: string = '';
    if (panFromJwt || this._formFields.cardNumber.value) {
      pan = panFromJwt ? panFromJwt : this._formFields.cardNumber.value;
    }

    const cardType: string = iinLookup.lookup(pan).type;
    return ControlFrame.NON_CVV_CARDS.includes(cardType);
  }

  private _callThreeDQueryRequest(): Observable<IAuthorizePaymentResponse> {
    const applyCybertonicaTid = (merchantFormData: IMerchantData) =>
      from(this._cybertonica.getTransactionId()).pipe(
        map(cybertonicaTid =>
          !cybertonicaTid
            ? merchantFormData
            : {
                ...merchantFormData,
                fraudcontroltransactionid: cybertonicaTid
              }
        )
      );

    return of({ ...this._merchantFormData }).pipe(
      switchMap(applyCybertonicaTid),
      switchMap(merchantFormData =>
        this._cardinalCommerce.performThreeDQuery(this._preThreeDRequestTypes, this._card, merchantFormData)
      )
    );
  }

  private _validateFormFields() {
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_CARD_NUMBER
    });
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_EXPIRATION_DATE
    });
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_SECURITY_CODE
    });
    this._validation.setFormValidity(this._formFieldsValidity);
  }

  private _publishBlurEvent(event: IMessageBusEvent): void {
    this.messageBus.publish(event);
  }

  private _formFieldChange(event: string, value: string) {
    switch (event) {
      case MessageBus.EVENTS.CHANGE_CARD_NUMBER:
        this._setCardPan(value);
        break;
      case MessageBus.EVENTS.CHANGE_EXPIRATION_DATE:
        this._setCardExpiryDate(value);
        break;
      case MessageBus.EVENTS.CHANGE_SECURITY_CODE:
        this._setCardSecurityCode(value);
        break;
    }
  }

  private _getPan(): string {
    return JwtDecode<IDecodedJwt>(this.params.jwt).payload.pan
      ? JwtDecode<IDecodedJwt>(this.params.jwt).payload.pan
      : '';
  }

  // private _getSecurityCode(): string {
  //   return JwtDecode<IDecodedJwt>(this.params.jwt).payload.securitycode
  //     ? JwtDecode<IDecodedJwt>(this.params.jwt).payload.securitycode
  //     : '';
  // }
  //
  // private _getSecurityCodeLength(): number {
  //   const cardDetails: IDecodedJwt = JwtDecode(StCodec.jwt);
  //   const securityCodeLength: number = this._card.securitycode ? this._card.securitycode.length : 0;
  //   const securityCodeFromJwtLength: number = this._getSecurityCode() ? this._getSecurityCode().length : 0;
  //   if (cardDetails.payload.pan && !securityCodeLength && !securityCodeFromJwtLength) {
  //     const { cvcLength } = iinLookup.lookup(cardDetails.payload.pan);
  //     return cvcLength.slice(-1)[0];
  //   }
  //   return securityCodeLength ? securityCodeLength : securityCodeFromJwtLength;
  // }

  private _setCardExpiryDate(value: string): void {
    this._card.expirydate = value;
  }

  private _setCardPan(value: string): void {
    this._card.pan = value;
  }

  private _setCardSecurityCode(value: string): void {
    this._card.securitycode = value;
  }

  private _setFormFieldsValidities(): void {
    this._formFieldsValidity.cardNumber.state = this._formFields.cardNumber.validity;
    this._formFieldsValidity.expirationDate.state = this._formFields.expirationDate.validity;
    this._formFieldsValidity.securityCode.state = this._formFields.securityCode.validity;
  }

  private _setInstances(): void {
    this._payment = new Payment();
    this._validation = new Validation();
  }

  private _updateMerchantFields(data: IMerchantData): void {
    this._merchantFormData = data;
  }

  private _initCybertonica(config: IConfig): void {
    const { cybertonicaApiKey } = config;

    if (cybertonicaApiKey) {
      this._cybertonica.init(cybertonicaApiKey);
    }
  }

  private _initCardinalCommerce(config: IConfig): void {
    this._cardinalCommerce.init(config).subscribe(() => {
      this._isPaymentReady = true;
    });
  }
}

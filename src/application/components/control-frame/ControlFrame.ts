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
import { ISetRequestTypes } from '../../core/models/ISetRequestTypes';
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
import { Observable } from 'rxjs';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Cybertonica } from '../../core/integrations/Cybertonica';
import { IConfig } from '../../../shared/model/config/IConfig';

@Service()
export class ControlFrame extends Frame {
  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];
  private static NON_CVV_CARDS: string[] = ['PIBA'];
  private static THREEDQUERY_EVENT: string = 'THREEDQUERY';

  private static _isRequestTypePropertyNotEmpty(data: ISubmitData): boolean {
    return data !== undefined && data.requestTypes !== undefined;
  }

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
  private _threeDQueryEvent: IMessageBusEvent = {
    data: '',
    type: MessageBus.EVENTS_PUBLIC.THREEDQUERY
  };
  private _threeDQueryResult: any;
  private _validation: Validation;
  private readonly _config$: Observable<IConfig>;

  constructor(
    private _localStorage: BrowserLocalStorage,
    private _sessionStorage: BrowserSessionStorage,
    private _communicator: InterFrameCommunicator,
    private _configProvider: ConfigProvider,
    private _notification: NotificationService,
    private _cybertonica: Cybertonica
  ) {
    super();
    this._config$ = this._configProvider.getConfig$();
    this._communicator.whenReceive(MessageBus.EVENTS_PUBLIC.CONFIG_CHECK).thenRespond(() => this._config$);
    this.onInit();
  }

  protected async onInit(): Promise<void> {
    super.onInit();
    this._setInstances();
    this._setFormFieldsValidities();
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_CARD_NUMBER, this._formFields.cardNumber);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, this._formFields.expirationDate);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE, this._formFields.securityCode);
    this._setRequestTypesEvent();
    this._bypassInitEvent();
    this._threeDInitEvent();
    this._loadCardinalEvent();
    this._processPaymentsEvent();
    this._submitFormEvent();
    this._updateMerchantFieldsEvent();
    this._resetJwtEvent();
    this._updateJwtEvent();
    this._loadControlFrame();
    this._initCybertonica();
  }

  protected getAllowedParams(): string[] {
    return super.getAllowedParams().concat(ControlFrame.ALLOWED_PARAMS);
  }

  private _bypassInitEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, (cachetoken: string) => {
      this._bypassInit(cachetoken);
    });
  }

  private _changeSecurityCodeLength(): void {
    if (!this._isCardWithoutCVV()) {
      this.messageBus.publish({
        data: this._getSecurityCodeLength(),
        type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
      });
    }
  }

  private _formFieldChangeEvent(event: string, field: IFormFieldState): void {
    this.messageBus.subscribe(event, (data: IFormFieldState) => {
      this._formFieldChange(event, data.value);
      ControlFrame._setFormFieldValidity(field, data);
      ControlFrame._setFormFieldValue(field, data);
    });
  }

  private _loadCardinalEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this._onLoadCardinal();
      this._changeSecurityCodeLength();
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

  private _setRequestTypesEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES, (data: ISetRequestTypes) => {
      this._setRequestTypes(data);
    });
  }

  private _threeDInitEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT_REQUEST, () => {
      this._threeDInit();
      this._changeSecurityCodeLength();
    });
  }

  private _updateJwtEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: any) => {
      ControlFrame._updateJwt(data.newJwt);
      this._loadControlFrame();
    });
  }

  private _updateMerchantFieldsEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: IMerchantData) => {
      this._updateMerchantFields(data);
    });
  }

  private _submitFormEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: ISubmitData) => {
      this._onSubmit(data);
    });
  }

  private _bypassCard() {
    this.messageBus.publish({ data: this._card, type: MessageBus.EVENTS_PUBLIC.BY_PASS_CARDINAL }, true);
  }

  private _bypassInit(cachetoken: string): void {
    this._payment.bypassInitRequest(cachetoken);
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.BY_PASS_INIT
      },
      true
    );
  }

  private _loadControlFrame(): void {
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME
      },
      true
    );
  }

  private _isCardBypassed(data: ISubmitData): boolean {
    return !this._card.pan
      ? data.bypassCards.includes(iinLookup.lookup(this._getPan()).type)
      : data.bypassCards.includes(iinLookup.lookup(this._card.pan).type);
  }

  private _onLoadCardinal(): void {
    this._isPaymentReady = true;
  }

  private _isThreeDRequestCalled(): boolean {
    return this._postThreeDRequestTypes.length !== 0;
  }

  private _onSubmit(data: ISubmitData): void {
    if (ControlFrame._isRequestTypePropertyNotEmpty(data)) {
      this._setRequestTypes(data);
    }
    this._requestPayment(data, this._isCardBypassed(data));
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
    this._validation.blockForm(FormState.COMPLETE);
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

  private _callThreeDQueryRequest() {
    this._payment
      .threeDQueryRequest(this._preThreeDRequestTypes, this._card, this._merchantFormData)
      .then((result: any) => {
        this._threeDQueryResult = result;
        this._threeDQueryEvent.data = result.response;
        this.messageBus.publish(this._threeDQueryEvent, true);
      });
  }

  private _requestPayment(data: ISubmitData, isCardBypassed: boolean): void {
    const isPanPiba: boolean = this._isCardWithoutCVV();
    const dataInJwt = data ? data.dataInJwt : false;
    const deferInit = data ? data.deferInit : false;
    const { validity, card } = this._validation.formValidation(
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

    if (deferInit) {
      this._threeDInit();
    }

    if (isCardBypassed) {
      this._bypassCard();
      return;
    }

    this._callThreeDQueryRequest();
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

  private _threeDInit(): void {
    this._payment.threeDInitRequest().then((result: any) => {
      this.messageBus.publish(
        {
          data: result.response,
          type: MessageBus.EVENTS_PUBLIC.THREEDINIT_RESPONSE
        },
        true
      );
    });
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

  private _getSecurityCode(): string {
    return JwtDecode<IDecodedJwt>(this.params.jwt).payload.securitycode
      ? JwtDecode<IDecodedJwt>(this.params.jwt).payload.securitycode
      : '';
  }

  private _getSecurityCodeLength(): number {
    const cardDetails: IDecodedJwt = JwtDecode(StCodec.jwt);
    const securityCodeLength: number = this._card.securitycode ? this._card.securitycode.length : 0;
    const securityCodeFromJwtLength: number = this._getSecurityCode() ? this._getSecurityCode().length : 0;
    if (cardDetails.payload.pan && !securityCodeLength && !securityCodeFromJwtLength) {
      const { cvcLength } = iinLookup.lookup(cardDetails.payload.pan);
      return cvcLength.slice(-1)[0];
    }
    return securityCodeLength ? securityCodeLength : securityCodeFromJwtLength;
  }

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
    this._payment = new Payment(this.params.jwt, this.params.gatewayUrl);
    this._validation = new Validation();
  }

  private _setRequestTypes(data: ISetRequestTypes): void {
    const threeDIndex = data.requestTypes.indexOf(ControlFrame.THREEDQUERY_EVENT);
    this._preThreeDRequestTypes = data.requestTypes.slice(0, threeDIndex + 1);
    this._postThreeDRequestTypes = data.requestTypes.slice(threeDIndex + 1, data.requestTypes.length);
  }

  private _updateMerchantFields(data: IMerchantData): void {
    this._merchantFormData = data;
  }

  private _initCybertonica(): void {
    this._config$.subscribe(config => {
      const { cybertonicaApiKey } = config;

      if (cybertonicaApiKey) {
        this._cybertonica.init(cybertonicaApiKey);
      }
    });
  }
}

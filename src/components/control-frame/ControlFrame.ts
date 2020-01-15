import JwtDecode from 'jwt-decode';
import { StCodec } from '../../core/classes/StCodec.class';
import { FormFieldsDetails } from '../../core/models/constants/FormFieldsDetails';
import { FormFieldsValidity } from '../../core/models/constants/FormFieldsValidity';
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
import { BinLookup } from '../../core/shared/BinLookup';
import { Frame } from '../../core/shared/Frame';
import { Language } from '../../core/shared/Language';
import { MessageBus } from '../../core/shared/MessageBus';
import { Notification } from '../../core/shared/Notification';
import { Payment } from '../../core/shared/Payment';
import { Validation } from '../../core/shared/Validation';

export class ControlFrame extends Frame {
  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];
  private static NON_CVV_CARDS: string[] = ['PIBA'];
  private static THREEDQUERY_EVENT: string = 'THREEDQUERY';

  private static _onFormFieldStateChange(field: IFormFieldState, data: IFormFieldState) {
    field.validity = data.validity;
    field.value = data.value;
  }

  private static _onResetJWT() {
    StCodec.jwt = StCodec.originalJwt;
  }

  private static _onUpdateJWT(jwt: string) {
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
  }

  private _binLookup: BinLookup;
  private _card: ICard;
  private _cardNumber: string;
  private _securityCode: string;
  private _expirationDate: string;
  private _decodedJwt: IDecodedJwt;
  private _isPaymentReady: boolean = false;
  private _formFields: IFormFieldsDetails = FormFieldsDetails;
  private _formFieldsValidity: IFormFieldsValidity = FormFieldsValidity;
  private _messageBusEventCardNumber: IMessageBusEvent;
  private _messageBusEventExpirationDate: IMessageBusEvent;
  private _messageBusEventSecurityCode: IMessageBusEvent;
  private _merchantFormData: IMerchantData;
  private _notification: Notification;
  private _payment: Payment;
  private _postThreeDRequestTypes: string[];
  private _preThreeDRequestTypes: string[];
  private _validation: Validation;
  private _threeDQueryEvent: IMessageBusEvent;
  private _threeDQueryResult: any;

  constructor() {
    super();
    this.onInit();
  }

  protected onInit() {
    super.onInit();
    this._setInstances();
    this._setFormFieldsValidities();
    this._setMessageBusEvents();
    this._initFormFieldChangeEvent(MessageBus.EVENTS.CHANGE_CARD_NUMBER, this._formFields.cardNumber);
    this._initFormFieldChangeEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, this._formFields.expirationDate);
    this._initFormFieldChangeEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE, this._formFields.securityCode);
    this._initSetRequestTypesEvent();
    this._initByPassInitEvent();
    this._initThreedinitEvent();
    this._initLoadCardinalEvent();
    this._initProcessPaymentsEvent();
    this._initSubmitFormEvent();
    this._initUpdateMerchantFieldsEvent();
    this._initResetJwtEvent();
    this._onLoad();
  }

  protected getAllowedParams() {
    return super.getAllowedParams().concat(ControlFrame.ALLOWED_PARAMS);
  }

  private _initFormFieldChangeEvent(event: string, field: IFormFieldState) {
    this.messageBus.subscribe(event, (data: IFormFieldState) => {
      if (event === MessageBus.EVENTS.CHANGE_CARD_NUMBER) {
        this._cardNumber = data.value;
      }
      if (event === MessageBus.EVENTS.CHANGE_EXPIRATION_DATE) {
        this._expirationDate = data.value;
      }
      if (event === MessageBus.EVENTS.CHANGE_SECURITY_CODE) {
        this._securityCode = data.value;
      }
      ControlFrame._onFormFieldStateChange(field, data);
    });
  }

  private _initSetRequestTypesEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES, (data: ISetRequestTypes) => {
      this._onSetRequestTypesEvent(data);
    });
  }

  private _initByPassInitEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, (cachetoken: string) => {
      this._onByPassInitEvent(cachetoken);
    });
  }

  private _initThreedinitEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, () => {
      this._onThreeDInitEvent();
    });
  }

  private _initLoadCardinalEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this._onLoadIntegrationModule();
    });
  }

  private _initProcessPaymentsEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS, (data: IResponseData) => {
      console.error(data);
      this._onProcessPaymentEvent(data);
    });
  }

  private _initSubmitFormEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: ISubmitData) => {
      this._proceedWith3DSecure(data);
    });
  }

  private _proceedWith3DSecure(data: ISubmitData): void {
    // @ts-ignore
    if (data.byPassCards.includes(this._binLookup.binLookup(this._cardNumber).type)) {
      this.messageBus.publish(
        {
          data: {
            expirydate: this._expirationDate,
            pan: this._cardNumber,
            securitycode: this._securityCode
          },
          type: MessageBus.EVENTS_PUBLIC.BY_PASS_CARDINAL
        },
        true
      );
    } else {
      this._onSubmit(data);
    }
  }

  private _initUpdateMerchantFieldsEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: any) => {
      this._storeMerchantData(data);
    });
  }

  private _initResetJwtEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.RESET_JWT, () => {
      ControlFrame._onResetJWT();
    });
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { newJwt } = data;
      ControlFrame._onUpdateJWT(newJwt);
      this._onLoad();
    });
  }

  private _onSetRequestTypesEvent(data: any) {
    const threeDIndex = data.requestTypes.indexOf(ControlFrame.THREEDQUERY_EVENT);
    this._preThreeDRequestTypes = data.requestTypes.slice(0, threeDIndex + 1);
    this._postThreeDRequestTypes = data.requestTypes.slice(threeDIndex + 1, data.requestTypes.length);
  }

  private _onSubmit(data: any) {
    if (data !== undefined && data.requestTypes !== undefined) {
      this._onSetRequestTypesEvent(data);
    }
    this._requestPayment(data);
  }

  private _onLoad() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  private _onLoadIntegrationModule() {
    this._isPaymentReady = true;
  }

  private _onThreeDInitEvent() {
    this._requestThreeDInit();
  }

  private _onByPassInitEvent(cachetoken: string) {
    this._requestByPassInit(cachetoken);
  }

  private _onProcessPaymentEvent(data: IResponseData) {
    if (this._postThreeDRequestTypes.length === 0) {
      this._processThreeDResponse(data);
    } else {
      this._processPayment(data);
    }
  }

  private _processThreeDResponse(data: IResponseData) {
    const { threedresponse } = data;
    if (threedresponse !== undefined) {
      StCodec.publishResponse(this._threeDQueryResult.response, this._threeDQueryResult.jwt, threedresponse);
    }
    this._notification.success(Language.translations.PAYMENT_SUCCESS);
  }

  private _processPayment(data: IResponseData) {
    this._payment
      .processPayment(this._postThreeDRequestTypes, this._card, this._merchantFormData, data)
      .then(() => {
        this._notification.success(Language.translations.PAYMENT_SUCCESS);
      })
      .catch((error: any) => {
        this._notification.error(Language.translations.PAYMENT_ERROR);
      })
      .finally(() => {
        this._validation.blockForm(false);
      });
  }

  private _requestByPassInit(cachetoken: string) {
    this._payment.byPassInitRequest(cachetoken);
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.BY_PASS_INIT
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  private _requestPayment(data: any) {
    const isPanPiba: boolean = this._getPan()
      ? ControlFrame.NON_CVV_CARDS.includes(this._binLookup.binLookup(this._getPan()).type)
      : false;
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
    if (validity) {
      if (deferInit) {
        this._requestThreeDInit();
      }

      this._payment
        .threeDQueryRequest(this._preThreeDRequestTypes, card, this._merchantFormData)
        .then((result: any) => {
          this._threeDQueryResult = result;
          this._threeDQueryEvent.data = result.response;
          this.messageBus.publish(this._threeDQueryEvent, true);
        });
    } else {
      this.messageBus.publish(this._messageBusEventCardNumber);
      this.messageBus.publish(this._messageBusEventExpirationDate);
      this.messageBus.publish(this._messageBusEventSecurityCode);
      this._validation.setFormValidity(this._formFieldsValidity);
    }
  }

  private _requestThreeDInit() {
    this._payment.threeDInitRequest().then((result: any) => {
      const messageBusEvent: IMessageBusEvent = {
        data: result.response,
        type: MessageBus.EVENTS_PUBLIC.THREEDINIT
      };
      this.messageBus.publish(messageBusEvent, true);
    });
  }

  private _setFormFieldsValidities() {
    this._formFieldsValidity.cardNumber.state = this._formFields.cardNumber.validity;
    this._formFieldsValidity.expirationDate.state = this._formFields.expirationDate.validity;
    this._formFieldsValidity.securityCode.state = this._formFields.securityCode.validity;
  }

  private _setMessageBusEvents() {
    this._messageBusEventCardNumber = {
      type: MessageBus.EVENTS.BLUR_CARD_NUMBER
    };
    this._messageBusEventExpirationDate = {
      type: MessageBus.EVENTS.BLUR_EXPIRATION_DATE
    };
    this._messageBusEventSecurityCode = {
      type: MessageBus.EVENTS.BLUR_SECURITY_CODE
    };
    this._threeDQueryEvent = {
      type: MessageBus.EVENTS_PUBLIC.THREEDQUERY
    };
  }

  private _getPan(): string {
    return JwtDecode<IDecodedJwt>(this.params.jwt).payload.pan
      ? JwtDecode<IDecodedJwt>(this.params.jwt).payload.pan
      : '';
  }

  private _setInstances() {
    this._payment = new Payment(this.params.jwt, this.params.gatewayUrl, this.params.origin);
    this._validation = new Validation();
    this._notification = new Notification();
    this._binLookup = new BinLookup();
  }

  private _storeMerchantData(data: any) {
    this._merchantFormData = data;
  }
}

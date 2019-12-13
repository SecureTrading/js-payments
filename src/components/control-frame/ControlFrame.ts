import JwtDecode from 'jwt-decode';
import { StCodec } from '../../core/classes/StCodec.class';
import {
  FormFieldsDetails,
  FormFieldsValidity,
  IFormFieldsDetails,
  IFormFieldsValidity,
  ISetRequestTypes,
  ISubmitData
} from '../../core/models/ControlFrame';
import { IMerchantData } from '../../core/models/MerchantData';
import BinLookup from '../../core/shared/BinLookup';
import { IFormFieldState } from '../../core/shared/FormFieldState';
import Frame from '../../core/shared/Frame';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Notification from '../../core/shared/Notification';
import Payment from '../../core/shared/Payment';
import { IStJwtObj } from '../../core/shared/StJwt';
import Validation from '../../core/shared/Validation';

/**
 * Defines frame which is essentially a hub which collects events and processes from whole library.
 */
class ControlFrame extends Frame {
  private static _onResetJWT() {
    StCodec.jwt = StCodec.originalJwt;
  }

  private static _onUpdateJWT(jwt: string) {
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
  }

  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];
  private static NON_CVV_CARDS: string[] = ['PIBA'];
  private static THREEDQUERY_EVENT: string = 'THREEDQUERY';
  private _binLookup: BinLookup;
  private _card: ICard;
  private _cardNumber: string;
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
    this._initChangeCardNumberEvent();
    this._initChangeExpirationDateEvent();
    this._initChangeSecurityCodeEvent();
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

  /**
   * Sets listener for CHANGE_CARD_NUMBER MessageBus event.
   * @private
   */
  private _initChangeCardNumberEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      this._cardNumber = data.value;
      this._onCardNumberStateChange(data);
    });
  }

  /**
   * Sets listener for CHANGE_EXPIRATION_DATE MessageBus event.
   * @private
   */
  private _initChangeExpirationDateEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
      this._onExpirationDateStateChange(data);
    });
  }

  /**
   * Sets listener for CHANGE_SECURITY_CODE MessageBus event.
   * @private
   */
  private _initChangeSecurityCodeEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
      this._onSecurityCodeStateChange(data);
    });
  }

  /**
   * Sets listener for SET_REQUEST_TYPES MessageBus event.
   * @private
   */
  private _initSetRequestTypesEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES, (data: ISetRequestTypes) => {
      this._onSetRequestTypesEvent(data);
    });
  }

  /**
   * Sets listener for BY_PASS_INIT MessageBus event.
   * @private
   */
  private _initByPassInitEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, (cachetoken: string) => {
      this._onByPassInitEvent(cachetoken);
    });
  }

  /**
   * Sets listener for THREEDINIT MessageBus event.
   * @private
   */
  private _initThreedinitEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, () => {
      this._onThreeDInitEvent();
    });
  }

  /**
   * Sets listener for LOAD_CARDINAL MessageBus event.
   * @private
   */
  private _initLoadCardinalEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this._onLoadCardinal();
    });
  }

  /**
   * Sets listener for PROCESS_PAYMENTS MessageBus event.
   * @private
   */
  private _initProcessPaymentsEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS, (data: IResponseData) => {
      this._onProcessPaymentEvent(data);
    });
  }

  /**
   * Sets listener for SUBMIT_FORM MessageBus event.
   * @private
   */
  private _initSubmitFormEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: ISubmitData) => {
      this._onSubmit(data);
    });
  }

  /**
   * Sets listener for UPDATE_MERCHANT_FIELDS MessageBus event.
   * @private
   */
  private _initUpdateMerchantFieldsEvent() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: any) => {
      this._storeMerchantData(data);
    });
  }

  /**
   * Sets listener for RESET_JWT MessageBus event.
   * @private
   */
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

  /**
   * Handles validity and value of card number field.
   * @param data
   * @private
   */
  private _onCardNumberStateChange(data: IFormFieldState) {
    this._formFields.cardNumber.validity = data.validity;
    this._formFields.cardNumber.value = data.value;
  }

  /**
   * Handles validity and value of expiration date field.
   * @param data
   * @private
   */
  private _onExpirationDateStateChange(data: IFormFieldState) {
    this._formFields.expirationDate.validity = data.validity;
    this._formFields.expirationDate.value = data.value;
  }

  /**
   * Handles validity and value of security code field.
   * @param data
   * @private
   */
  private _onSecurityCodeStateChange(data: IFormFieldState) {
    this._formFields.securityCode.validity = data.validity;
    this._formFields.securityCode.value = data.value;
  }

  /**
   * Splits post and pre threedrequests types.
   * @param data
   * @private
   */
  private _onSetRequestTypesEvent(data: any) {
    const threeDIndex = data.requestTypes.indexOf(ControlFrame.THREEDQUERY_EVENT);
    this._preThreeDRequestTypes = data.requestTypes.slice(0, threeDIndex + 1);
    this._postThreeDRequestTypes = data.requestTypes.slice(threeDIndex + 1, data.requestTypes.length);
  }

  /**
   * Handles submit action.
   * @param data
   * @private
   */
  private _onSubmit(data: any) {
    if (data !== undefined && data.requestTypes !== undefined) {
      this._onSetRequestTypesEvent(data);
    }
    this._requestPayment(data);
  }

  /**
   * Triggers LOAD_CONTROL_FRAME event on init.
   * @private
   */
  private _onLoad() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  /**
   * Sets payment as ready after Cardinal Commerce has been loaded.
   * @private
   */
  private _onLoadCardinal() {
    this._isPaymentReady = true;
  }

  /**
   * Handles _onThreeDInitEvent.
   * @private
   */
  private _onThreeDInitEvent() {
    this._requestThreeDInit();
  }

  /**
   * Handles _onByPassInitEvent with cachetoken.
   * @param cachetoken
   * @private
   */
  private _onByPassInitEvent(cachetoken: string) {
    this._requestByPassInit(cachetoken);
  }

  /**
   * Sets _processThreeDResponse or _processPayment depends on threedrequest types,
   * @param data
   * @private
   */
  private _onProcessPaymentEvent(data: IResponseData) {
    if (this._postThreeDRequestTypes.length === 0) {
      this._processThreeDResponse(data);
    } else {
      this._processPayment(data);
    }
  }

  /**
   * Processes 3DResponse.
   * @param data
   * @private
   */
  private _processThreeDResponse(data: IResponseData) {
    const { threedresponse } = data;
    if (threedresponse !== undefined) {
      StCodec.publishResponse(this._threeDQueryResult.response, this._threeDQueryResult.jwt, threedresponse);
    }
    this._notification.success(Language.translations.PAYMENT_SUCCESS);
  }

  /**
   * Processes payment flow.
   * @param data
   * @private
   */
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

  /**
   * Triggers byPassInitRequest and publish this event with data.
   * @param cachetoken
   * @private
   */
  private _requestByPassInit(cachetoken: string) {
    this._payment.byPassInitRequest(cachetoken);
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.BY_PASS_INIT
    };
    this.messageBus.publish(messageBusEvent, true);
  }

  private _getPan() {
    const decodedJwt: any = JwtDecode<IStJwtObj>(this.params.jwt);
    return decodedJwt.payload.pan ? JwtDecode<IStJwtObj>(this.params.jwt).payload.pan : this._cardNumber;
  }

  private _requestPayment(data: any) {
    const isPanPiba: boolean = ControlFrame.NON_CVV_CARDS.includes(this._binLookup.binLookup(this._getPan()).type);
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

  /**
   * Triggers threeDInitRequest with MessageBus THREEDINIT event and publish this event with data.
   * @private
   */
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

export default ControlFrame;

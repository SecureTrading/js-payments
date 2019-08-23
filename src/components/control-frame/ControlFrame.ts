import { StCodec } from '../../core/classes/StCodec.class';
import { ISetRequestTypes, ISubmitData } from '../../core/models/ControlFrame';
import { IMerchantData } from '../../core/models/MerchantData';
import Frame from '../../core/shared/Frame';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Notification from '../../core/shared/Notification';
import Payment from '../../core/shared/Payment';
import Validation from '../../core/shared/Validation';

/**
 * Defines frame which is essentially a hub which collects events and processes from whole library.
 */
class ControlFrame extends Frame {
  private _payment: Payment;
  private _isPaymentReady: boolean = false;
  private _merchantFormData: IMerchantData;
  private _card: ICard;
  private _validation: Validation;
  private _preThreeDRequestTypes: string[];
  private _postThreeDRequestTypes: string[];
  private _threeDQueryResult: any;
  private _notification: Notification;
  private _formFields: {
    cardNumber: IFormFieldState;
    expirationDate: IFormFieldState;
    securityCode: IFormFieldState;
  } = {
    cardNumber: {
      validity: false,
      value: ''
    },
    expirationDate: {
      validity: false,
      value: ''
    },
    securityCode: {
      validity: false,
      value: ''
    }
  };

  private _formFieldsValidity = {
    cardNumber: {
      message: '',
      state: this._formFields.cardNumber.validity
    },
    expirationDate: {
      message: '',
      state: this._formFields.expirationDate.validity
    },
    securityCode: {
      message: '',
      state: this._formFields.expirationDate.validity
    }
  };

  private _messageBusEventCardNumber: IMessageBusEvent = {
    type: MessageBus.EVENTS.BLUR_CARD_NUMBER
  };
  private _messageBusEventExpirationDate: IMessageBusEvent = {
    type: MessageBus.EVENTS.BLUR_EXPIRATION_DATE
  };
  private _messageBusEventSecurityCode: IMessageBusEvent = {
    type: MessageBus.EVENTS.BLUR_SECURITY_CODE
  };

  private _threedqueryEvent: IMessageBusEvent = {
    type: MessageBus.EVENTS_PUBLIC.THREEDQUERY
  };

  constructor() {
    super();
    this.onInit();
  }

  /**
   * Triggers methods needed on initializing class.
   */
  protected onInit() {
    super.onInit();
    this._payment = new Payment(this._params.jwt, this._params.gatewayUrl, this._params.origin);
    this._validation = new Validation();
    this._notification = new Notification();
    this._initSubscriptions();
    this._onLoad();
  }

  /**
   * Gets allowed parameters including locale from parent class.
   */
  protected getAllowedParams() {
    return super.getAllowedParams().concat(['origin', 'jwt', 'gatewayUrl']);
  }

  /**
   * Sets listeners for each MessageBus events.
   * @private
   */
  private _initSubscriptions() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      this._onCardNumberStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
      this._onExpirationDateStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
      this._onSecurityCodeStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES, (data: ISetRequestTypes) => {
      this._onSetRequestTypesEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, (cachetoken: string) => {
      this._onByPassInitEvent(cachetoken);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, () => {
      this._onThreeDInitEvent();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this._onLoadCardinal();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS, (data: IResponseData) => {
      this._onProcessPaymentEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: ISubmitData) => {
      this._onSubmit(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: any) => {
      this._storeMerchantData(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.RESET_JWT, (data: IFormFieldState) => {
      this._onResetJWT();
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
   * Resets JWT in case of Error
   * @param data
   * @private
   */
  private _onResetJWT() {
    StCodec.jwt = StCodec.originalJwt;
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
    const threeDIndex = data.requestTypes.indexOf('THREEDQUERY');
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
    this._messageBus.publish(messageBusEvent, true);
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
      .catch(() => {
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
    this._messageBus.publish(messageBusEvent, true);
  }

  /**
   * Sends threeDQueryRequest depends on validity status.
   * @param data
   */
  private _requestPayment(data: any) {
    const dataInJwt = data ? data.dataInJwt : false;
    const { validity, card } = this._validation.formValidation(dataInJwt, this._isPaymentReady, this._formFields);
    if (validity) {
      this._payment
        .threeDQueryRequest(this._preThreeDRequestTypes, card, this._merchantFormData)
        .then((result: any) => {
          this._threeDQueryResult = result;
          this._threedqueryEvent.data = result.response;
          this._messageBus.publish(this._threedqueryEvent, true);
        });
    } else {
      this._messageBus.publish(this._messageBusEventCardNumber);
      this._messageBus.publish(this._messageBusEventExpirationDate);
      this._messageBus.publish(this._messageBusEventSecurityCode);
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
      this._messageBus.publish(messageBusEvent, true);
    });
  }

  /**
   * Assigned received merchant data.
   * @param data
   * @private
   */
  private _storeMerchantData(data: any) {
    this._merchantFormData = data;
  }
}

export default ControlFrame;

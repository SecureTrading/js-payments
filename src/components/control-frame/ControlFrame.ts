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
 *
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

  constructor() {
    super();
    this.onInit();
  }

  /**
   *
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
   *
   * @private
   */
  protected getAllowedParams() {
    return super.getAllowedParams().concat(['origin', 'jwt', 'gatewayUrl']);
  }

  /**
   *
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
      console.log('SUBMIT_FORM');
      console.error(data);
      this._onSubmit(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: any) => {
      this._storeMerchantData(data);
    });
  }

  /**
   *
   * @param data
   * @private
   */
  private _onCardNumberStateChange(data: IFormFieldState) {
    this._formFields.cardNumber.validity = data.validity;
    this._formFields.cardNumber.value = data.value;
  }

  /**
   *
   * @param data
   * @private
   */
  private _onExpirationDateStateChange(data: IFormFieldState) {
    this._formFields.expirationDate.validity = data.validity;
    this._formFields.expirationDate.value = data.value;
  }

  /**
   *
   * @param data
   * @private
   */
  private _onSecurityCodeStateChange(data: IFormFieldState) {
    this._formFields.securityCode.validity = data.validity;
    this._formFields.securityCode.value = data.value;
  }

  /**
   *
   * @param data
   * @private
   */
  private _onSetRequestTypesEvent(data: any) {
    const threeDIndex = data.requestTypes.indexOf('THREEDQUERY');
    this._preThreeDRequestTypes = data.requestTypes.slice(0, threeDIndex + 1);
    this._postThreeDRequestTypes = data.requestTypes.slice(threeDIndex + 1, data.requestTypes.length);
  }

  /**
   *
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
   *
   * @private
   */
  private _onLoad() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME
    };
    this._messageBus.publish(messageBusEvent, true);
  }

  /**
   *
   * @private
   */
  private _onLoadCardinal() {
    this._isPaymentReady = true;
  }

  /**
   *
   * @private
   */
  private _onThreeDInitEvent() {
    this._requestThreeDInit();
  }

  /**
   *
   * @param data
   * @private
   */
  private _onByPassInitEvent(data: string) {
    this._requestByPassInit(data);
  }

  /**
   *
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
   * Process 3DResponse.
   * @param data
   * @private
   */
  private _processThreeDResponse(data: IResponseData) {
    if (data.threedresponse !== undefined) {
      StCodec.publishResponse(this._threeDQueryResult.response, this._threeDQueryResult.jwt, data.threedresponse);
    }
    this._notification.success(Language.translations.PAYMENT_SUCCESS);
  }

  /**
   * Process payment flow.
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
   *
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
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.THREEDQUERY
    };
    const formValidity = {
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
    const { validity, card } = this._validation.formValidation(dataInJwt, this._isPaymentReady, this._formFields);
    if (validity) {
      this._payment
        .threeDQueryRequest(this._preThreeDRequestTypes, card, this._merchantFormData)
        .then((result: any) => {
          this._threeDQueryResult = result;
          messageBusEvent.data = result.response;
          this._messageBus.publish(messageBusEvent, true);
        });
    } else {
      this._validation.setFormValidity(formValidity);
    }
  }

  /**
   *
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
   *
   * @param data
   * @private
   */
  private _storeMerchantData(data: any) {
    this._merchantFormData = data;
  }
}

export default ControlFrame;

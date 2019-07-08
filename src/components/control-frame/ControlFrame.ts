import { StCodec } from '../../core/classes/StCodec.class';
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
export default class ControlFrame extends Frame {
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
  public onInit() {
    super.onInit();
    this._payment = new Payment(this._params.jwt, this._params.gatewayUrl, this._params.origin);
    this._validation = new Validation();
    this._notification = new Notification();
    this.initSubscriptions();
    this.onLoad();
  }

  /**
   *
   * @private
   */
  protected getAllowedParams() {
    return super.getAllowedParams().concat(['origin', 'jwt', 'gatewayUrl']);
  }

  private initSubscriptions() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      this.onCardNumberStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
      this.onExpirationDateStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
      this.onSecurityCodeStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES, (data: any) => {
      this.onSetRequestTypesEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, (cachetoken: string) => {
      this.onByPassInitEvent(cachetoken);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, () => {
      this.onThreeDInitEvent();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this.onLoadCardinal();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS, (data: any) => {
      this._onProcessPaymentEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: any) => {
      this.onSubmit(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: any) => {
      this.storeMerchantData(data);
    });
  }

  private onCardNumberStateChange(data: IFormFieldState) {
    this._formFields.cardNumber.validity = data.validity;
    this._formFields.cardNumber.value = data.value;
  }

  private onExpirationDateStateChange(data: IFormFieldState) {
    this._formFields.expirationDate.validity = data.validity;
    this._formFields.expirationDate.value = data.value;
  }

  private onSecurityCodeStateChange(data: IFormFieldState) {
    this._formFields.securityCode.validity = data.validity;
    this._formFields.securityCode.value = data.value;
  }

  private onSetRequestTypesEvent(data: any) {
    const threeDIndex = data.requestTypes.indexOf('THREEDQUERY');
    this._preThreeDRequestTypes = data.requestTypes.slice(0, threeDIndex + 1);
    this._postThreeDRequestTypes = data.requestTypes.slice(threeDIndex + 1, data.requestTypes.length);
  }

  private onSubmit(data: any) {
    if (data !== undefined && data.requestTypes !== undefined) {
      this.onSetRequestTypesEvent(data);
    }
    this.requestPayment(data);
  }

  private onLoad() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME
    };
    this._messageBus.publish(messageBusEvent, true);
  }

  private onLoadCardinal() {
    this._isPaymentReady = true;
  }

  private onThreeDInitEvent() {
    this.requestThreeDInit();
  }

  private onByPassInitEvent(data: string) {
    this.requestByPassInit(data);
  }

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
      .catch((error: any) => {
        this._notification.error(Language.translations.PAYMENT_ERROR);
      })
      .finally(() => {
        this._validation.blockForm(false);
      });
  }

  private requestByPassInit(cachetoken: string) {
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
  private requestPayment(data: any) {
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

  private requestThreeDInit() {
    this._payment.threeDInitRequest().then((result: any) => {
      const messageBusEvent: IMessageBusEvent = {
        data: result.response,
        type: MessageBus.EVENTS_PUBLIC.THREEDINIT
      };
      this._messageBus.publish(messageBusEvent, true);
    });
  }

  private storeMerchantData(data: any) {
    this._merchantFormData = data;
  }
}

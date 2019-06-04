import { IMerchantData } from '../../core/models/MerchantData';
import { INotificationEvent, NotificationType } from '../../core/models/NotificationEvent';
import Frame from '../../core/shared/Frame';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Payment from '../../core/shared/Payment';
import Validation from '../../core/shared/Validation';

export default class ControlFrame extends Frame {
  private _payment: Payment;
  private _isPaymentReady: boolean = false;
  private _merchantFormData: IMerchantData;
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
  private _card: ICard;

  constructor() {
    super();
    this.onInit();
  }

  public onInit() {
    super.onInit();
    this._payment = new Payment(this._params.jwt, this._params.origin);
    this.initSubscriptions();
    this.onLoad();
  }

  /**
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  // @TODO STJS-205 refactor into Payments
  public setNotification(type: string, content: string) {
    const notificationEvent: INotificationEvent = {
      content,
      type
    };
    const messageBusEvent: IMessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this._messageBus.publish(messageBusEvent);
  }

  protected _getAllowedParams() {
    return super._getAllowedParams().concat(['origin', 'jwt']);
  }

  protected _getAllowedStyles() {
    // @TODO: remove
    const allowed = super._getAllowedStyles();
    return allowed;
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
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, () => {
      this.onThreeDInitEvent();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this.onLoadCardinal();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.AUTH, (data: any) => {
      this.onAuthEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.CACHETOKENISE, (data: any) => {
      this.onCachetokeniseEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: any) => {
      this.onSubmit(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: any) => {
      this.storeMerchantData(data);
    });
  }

  private storeMerchantData(data: any) {
    this._merchantFormData = data;
  }

  private onSubmit(data: any) {
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

  private onThreeDInitEvent() {
    this.requestThreeDInit();
  }

  private onAuthEvent(data: any) {
    this.requestAuth(data);
  }

  private onCachetokeniseEvent(data: any) {
    this.requestCachetokenise(data);
  }

  private requestThreeDInit() {
    this._payment.threeDInitRequest().then(responseBody => {
      const messageBusEvent: IMessageBusEvent = {
        data: responseBody,
        type: MessageBus.EVENTS_PUBLIC.THREEDINIT
      };
      this._messageBus.publish(messageBusEvent, true);
    });
  }

  private requestAuth(data: any) {
    this._processPayment(data, 'AUTH');
  }

  private requestCachetokenise(data: any) {
    this._processPayment(data, 'CACHETOKENISE');
  }

  // @TODO STJS-205 refactor into Payments
  private _processPayment(data: any, type: string) {
    this._payment
      .processPayment({ requesttypedescription: type }, this._card, this._merchantFormData, data)
      .then((response: object) => response)
      .then((respData: object) => {
        this.setNotification(NotificationType.Success, Language.translations.PAYMENT_SUCCESS);
        return respData;
      })
      .catch(() => {
        this.setNotification(NotificationType.Error, Language.translations.PAYMENT_ERROR);
      });
  }

  private setFormValidity(state: any) {
    const validationEvent: IMessageBusEvent = {
      data: { ...state },
      type: MessageBus.EVENTS.VALIDATE_FORM
    };
    this._messageBus.publish(validationEvent, true);
  }

  private requestPayment(data: any) {
    const dataInJwt = data ? data.dataInJwt : false;
    let isFormValid: boolean;
    const formValidity = {
      cardNumber: this._formFields.cardNumber.validity,
      expirationDate: this._formFields.expirationDate.validity,
      securityCode: this._formFields.securityCode.validity
    };
    if (dataInJwt) {
      isFormValid = true;
      this._isPaymentReady = true;
    } else {
      isFormValid =
        this._formFields.cardNumber.validity &&
        this._formFields.expirationDate.validity &&
        this._formFields.securityCode.validity;

      this._card = {
        expirydate: this._formFields.expirationDate.value,
        pan: this._formFields.cardNumber.value,
        securitycode: this._formFields.securityCode.value
      };
    }

    if (this._isPaymentReady && isFormValid) {
      const validation = new Validation();
      this._payment.threeDQueryRequest(this._card, this._merchantFormData).then(responseBody => {
        const messageBusEvent: IMessageBusEvent = {
          data: responseBody,
          type: MessageBus.EVENTS_PUBLIC.THREEDQUERY
        };
        validation.blockForm(true);
        this._messageBus.publish(messageBusEvent, true);
      });
    } else {
      this.setFormValidity(formValidity);
    }
  }
}

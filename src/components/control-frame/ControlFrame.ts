import MessageBus from '../../core/shared/MessageBus';
import Payment from '../../core/shared/Payment';
import Selectors from '../../core/shared/Selectors';

export default class ControlFrame {
  private _buttonElement: HTMLButtonElement;
  private _messageBus: MessageBus;
  private _payment: Payment;
  private _isPaymentReady: boolean = false;
  private _formFields: { cardNumber: FormFieldState; expirationDate: FormFieldState; securityCode: FormFieldState } = {
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
  private _card: Card;

  public static ifFieldExists(): HTMLButtonElement {
    // @ts-ignore
    return document.getElementById(Selectors.CONTROL_FRAME_BUTTON_SELECTOR);
  }

  constructor() {
    this._buttonElement = ControlFrame.ifFieldExists();
    this._messageBus = new MessageBus();
    this._payment = new Payment();
    this.onInit();
  }

  private onInit() {
    this.initEventListeners();
    this.initSubscriptions();
    this.onLoad();
  }

  private initEventListeners() {
    this._buttonElement.addEventListener('click', (event: Event) => {
      event.preventDefault();
      this.onClick();
    });
  }

  private initSubscriptions() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: FormFieldState) => {
      this.onCardNumberStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: FormFieldState) => {
      this.onExpirationDateStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: FormFieldState) => {
      this.onSecurityCodeStateChange(data);
    });

    // @TODO: use MessageBus to register listeners
    window.addEventListener('message', (event: MessageEvent) => {
      let messageBusEvent: MessageBusEvent = event.data;

      switch (messageBusEvent.type) {
        case 'THREEDINIT':
          this._payment.threeDInitRequest().then(responseBody => {
            const messageBusEvent: MessageBusEvent = {
              type: MessageBus.EVENTS_PUBLIC.THREEDINIT,
              data: responseBody
            };
            this._messageBus.publish(messageBusEvent, true);
          });
          break;
        case 'LOAD_CARDINAL':
          this._isPaymentReady = true;
          break;
        case 'AUTH':
          this._payment.authorizePayment(this._card, messageBusEvent.data);
          break;
        default:
          break;
      }
    });
  }

  private onClick() {
    this.requestPayment();
  }

  private onLoad() {
    const messageBusEvent: MessageBusEvent = { type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME };
    this._messageBus.publish(messageBusEvent, true);
  }

  private onCardNumberStateChange(data: FormFieldState) {
    this._formFields.cardNumber.validity = data.validity;
    this._formFields.cardNumber.value = data.value;
  }

  private onExpirationDateStateChange(data: FormFieldState) {
    this._formFields.expirationDate.validity = data.validity;
    this._formFields.expirationDate.value = data.value;
  }

  private onSecurityCodeStateChange(data: FormFieldState) {
    this._formFields.securityCode.validity = data.validity;
    this._formFields.securityCode.value = data.value;
  }

  private requestPayment() {
    this._card = {
      expirydate: this._formFields.expirationDate.value,
      pan: this._formFields.cardNumber.value,
      securitycode: this._formFields.securityCode.value
    };

    const isFormValid: boolean =
      this._formFields.cardNumber.validity &&
      this._formFields.expirationDate.validity &&
      this._formFields.securityCode.validity;

    if (this._isPaymentReady && isFormValid) {
      this._payment.threeDQueryRequest(this._card).then(responseBody => {
        const messageBusEvent: MessageBusEvent = {
          type: MessageBus.EVENTS_PUBLIC.THREEDQUERY,
          data: responseBody
        };
        this._messageBus.publish(messageBusEvent, true);
      });
    }
  }
}

import Selectors from '../../core/shared/Selectors';
import MessageBus from '../../core/shared/MessageBus';
import Payment from '../../core/shared/Payment';
import Frame from '../../core/shared/Frame';

export default class ControlFrame extends Frame {
  private _buttonElement: HTMLButtonElement;
  private _messageBus: MessageBus;
  private _payment: Payment;
  private _formFields = {
    cardNumber: {
      validity: '',
      value: ''
    },
    expirationDate: {
      validity: '',
      value: ''
    },
    securityCode: {
      validity: '',
      value: ''
    }
  };

  constructor() {
    super();
    this._buttonElement = ControlFrame.ifFieldExists();
    this._messageBus = new MessageBus();
    this._payment = new Payment();
    this.onInit();
  }

  static ifFieldExists(): HTMLButtonElement {
    // @ts-ignore
    return document.getElementById(Selectors.CONTROL_FRAME_BUTTON_SELECTOR);
  }

  protected onInit() {
    super.onInit();
    this.initEventListeners();
    this.initSubscriptions();
  }

  protected _getAllowedStyles () {
    let allowed = super._getAllowedStyles();
    allowed = { ...allowed,
                "font-size-button": [{property: "font-size", selector: "#st-control-frame-button"}],
                "line-height-button": [{property: "line-height", selector: "#st-control-frame-button"}],
              }
    return allowed;
  }

  private onClick() {
    this._payment.cacheTokenize({
      pan: this._formFields.cardNumber.value,
      expirydate: this._formFields.expirationDate.value,
      securitycode: this._formFields.securityCode.value
    });
  }

  private initSubscriptions() {
    this._messageBus.subscribe(MessageBus.EVENTS.CARD_NUMBER_CHANGE, (data: any) => {
      this.onCardNumberStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.EXPIRATION_DATE_CHANGE, (data: any) => {
      this.onExpirationDateStateChange(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.SECURITY_CODE_CHANGE, (data: any) => {
      this.onSecurityCodeStateChange(data);
    });
  }

  private onCardNumberStateChange(data: any) {
    this._formFields.cardNumber.validity = data.validity;
    this._formFields.cardNumber.value = data.value;
  }

  private onExpirationDateStateChange(data: any) {
    this._formFields.expirationDate.validity = data.validity;
    this._formFields.expirationDate.value = data.value;
  }

  private onSecurityCodeStateChange(data: any) {
    this._formFields.securityCode.validity = data.validity;
    this._formFields.securityCode.value = data.value;
  }

  private initEventListeners() {
    this._buttonElement.addEventListener('click', (event: Event) => {
      event.preventDefault();
      this.onClick();
    });
  }
}

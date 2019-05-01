import { environment } from '../../environments/environment';
import Frame from '../../core/shared/Frame';
import MessageBus from '../../core/shared/MessageBus';
import Payment from '../../core/shared/Payment';
import PaymentMock from '../../core/shared/PaymentMock';

export default class ControlFrame extends Frame {
  private _frameParams: { origin: string; jwt: string };
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

  constructor() {
    super();
    this.setFrameParams();
    this._messageBus = new MessageBus(this._frameParams.origin);
    this._payment = environment.testEnvironment
      ? new PaymentMock(this._frameParams.jwt)
      : new Payment(this._frameParams.jwt);
    this.onInit();
  }

  public onInit() {
    super.onInit();
    this.initSubscriptions();
    this.onLoad();
  }

  private setFrameParams() {
    // @ts-ignore
    const frameUrl = new URL(window.location);
    const frameParams = new URLSearchParams(frameUrl.search); // @TODO: add polyfill for IE

    this._frameParams = {
      jwt: frameParams.get('jwt'),
      origin: frameParams.get('origin')
    };
  }

  protected _getAllowedStyles() {
    // @TODO: remove
    let allowed = super._getAllowedStyles();
    return allowed;
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
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, () => {
      this.onThreeDInitEvent();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL, () => {
      this.onLoadCardinal();
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.AUTH, (data: any) => {
      this.onAuthEvent(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, () => {
      this.onSubmit();
    });
  }

  private onSubmit() {
    this.requestPayment();
  }

  private onLoad() {
    const messageBusEvent: MessageBusEvent = { type: MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME };
    this._messageBus.publish(messageBusEvent, true);
  }

  private onLoadCardinal() {
    this._isPaymentReady = true;
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

  private onThreeDInitEvent() {
    this.requestThreeDInit();
  }

  private onAuthEvent(data: any) {
    this.requestAuth(data);

  private requestThreeDInit() {
    this._payment.threeDInitRequest().then(responseBody => {
      const messageBusEvent: MessageBusEvent = {
        type: MessageBus.EVENTS_PUBLIC.THREEDINIT,
        data: responseBody
      };
      this._messageBus.publish(messageBusEvent, true);
    });
  }

  private requestAuth(threedResponse: any) {
    this._payment.authorizePayment(this._card, threedResponse);
  }

  private requestPayment() {
    const isFormValid: boolean =
      this._formFields.cardNumber.validity &&
      this._formFields.expirationDate.validity &&
      this._formFields.securityCode.validity;

    this._card = {
      expirydate: this._formFields.expirationDate.value,
      pan: this._formFields.cardNumber.value,
      securitycode: this._formFields.securityCode.value
    };

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

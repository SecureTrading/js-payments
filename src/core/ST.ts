import { environment } from '../environments/environment';
import Element from './Element';
import CardinalCommerce from './classes/CardinalCommerce';
import VisaCheckout from './classes/VisaCheckout';
import MessageBus from './shared/MessageBus';
import Selectors from './shared/Selectors';
import { Styles } from './shared/Styler';

/***
 * Establishes connection with ST, defines client.
 */
export default class ST {
  public jwt: string;
  public origin: string;
  public fieldsIds: any;
  public styles: Styles;
  public payments: object[];

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public static registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  constructor(jwt: string, origin: string, fieldsIds: any, styles: Styles, payments: object[]) {
    this.jwt = jwt;
    this.origin = origin;
    this.fieldsIds = fieldsIds;
    this.styles = styles;
    this.payments = payments;

    this._onInit();
  }

  private _onInit() {
    this._initElements();
    this._init3DSecure();
    this._initWallets(this.jwt);
    this._setFormListener();
  }

  private _initElements() {
    const cardNumber = new Element();
    const expirationDate = new Element();
    const securityCode = new Element();
    const animatedCard = new Element();
    const notificationFrame = new Element();
    const controlFrame = new Element();

    cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles);
    const cardNumberMounted = cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);

    expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles);
    const expirationDateMounted = expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);

    securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles);
    const securityCodeMounted = securityCode.mount(Selectors.SECURITY_CODE_IFRAME);

    notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles);
    const notificationFrameMounted = notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME);

    controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles, { jwt: this.jwt, origin: this.origin });
    const controlFrameMounted = controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME);

    animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME);
    const animatedCardMounted = animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME);

    ST.registerElements(
      [
        cardNumberMounted,
        expirationDateMounted,
        securityCodeMounted,
        notificationFrameMounted,
        controlFrameMounted,
        animatedCardMounted
      ],
      [
        this.fieldsIds.cardNumber,
        this.fieldsIds.expirationDate,
        this.fieldsIds.securityCode,
        this.fieldsIds.notificationFrame,
        this.fieldsIds.controlFrame,
        this.fieldsIds.animatedCard
      ]
    );
  }

  private _init3DSecure() {
    new CardinalCommerce();
  }

  private _initWallets(jwt: string) {
    let visaCheckoutConfig = this._getAPMConfig(environment.APM_NAMES.VISA_CHECKOUT);

    if (visaCheckoutConfig) {
      new VisaCheckout(visaCheckoutConfig, jwt);
    }
  }

  private _setFormListener() {
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      const messageBusEvent: MessageBusEvent = { type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM };
      const messageBus = new MessageBus();

      messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
    });
  }

  /**
   * Gets APM config according to given apmName
   * @param apmName - name of payment
   * @private
   */
  private _getAPMConfig(apmName: string) {
    return Object.values(this.payments).find((item: { name: string }) => item.name === apmName);
  }
}

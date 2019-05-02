import Element from '../Element';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';

/**
 * Defines all elements of form and their  placement on merchant site.
 */
class Form {
  public styles: IStyles;
  public onlyWallets: boolean;
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  public fieldsIds: any;
  public jwt: any;
  public origin: any;
  private cardNumberMounted: HTMLElement;
  private expirationDateMounted: HTMLElement;
  private securityCodeMounted: HTMLElement;
  private animatedCardMounted: HTMLElement;
  private notificationFrameMounted: HTMLElement;
  private controlFrameMounted: HTMLElement;
  private cardNumber: Element;
  private expirationDate: Element;
  private securityCode: Element;
  private animatedCard: Element;
  private notificationFrame: Element;
  private controlFrame: Element;
  private messageBusInstance: MessageBus;
  private messageBusEvent: IMessageBusEvent;

  constructor(jwt: any, origin: any, onlyWallets: boolean, fieldsIds: [], styles: IStyles) {
    this.styles = styles;
    this.onlyWallets = onlyWallets;
    this.fieldsIds = fieldsIds;
    this.elementsTargets = this.setElementsFields(onlyWallets);
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.origin = origin;
    this._onInit();
  }

  /**
   * Defines form elements if merchant chooses only apms or not
   * @param onlyWallets
   */
  public setElementsFields = (onlyWallets: boolean) =>
    onlyWallets
      ? [this.fieldsIds.notificationFrame, this.fieldsIds.controlFrame]
      : [
          this.fieldsIds.cardNumber,
          this.fieldsIds.expirationDate,
          this.fieldsIds.securityCode,
          this.fieldsIds.animatedCard,
          this.fieldsIds.notificationFrame,
          this.fieldsIds.controlFrame
        ];

  public _onInit() {
    if (!this.onlyWallets) {
      this.initCardFields();
      this._setFormListener();
    }
    this.initFormFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Inits credit card and animated card fields (if merchant wanted this type of payment)
   */
  public initCardFields() {
    this.cardNumber = new Element();
    this.expirationDate = new Element();
    this.securityCode = new Element();
    this.animatedCard = new Element();

    this.cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles);
    this.cardNumberMounted = this.cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this.cardNumberMounted);

    this.expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles);
    this.expirationDateMounted = this.expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this.expirationDateMounted);

    this.securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles);
    this.securityCodeMounted = this.securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this.securityCodeMounted);

    this.animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME);
    this.animatedCardMounted = this.animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME);
    this.elementsToRegister.push(this.animatedCardMounted);
  }

  /**
   * Inits necessary fields - notification and control frame
   */
  public initFormFields() {
    this.notificationFrame = new Element();
    this.controlFrame = new Element();

    this.notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles);
    this.notificationFrameMounted = this.notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME);
    this.elementsToRegister.push(this.notificationFrameMounted);

    this.controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles, {
      jwt: this.jwt,
      origin: this.origin
    });
    this.controlFrameMounted = this.controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME);
    this.elementsToRegister.push(this.controlFrameMounted);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  /**
   * Sets submit listener on form
   * @private
   */
  private _setFormListener() {
    this.messageBusEvent = { type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM };
    this.messageBusInstance = new MessageBus();
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      this.messageBusInstance.publishFromParent(this.messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
    });
  }
}

export default Form;

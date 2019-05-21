import Element from '../Element';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';
import Register from './Register.class';

/**
 * Defines all card elements of form and their  placement on merchant site.
 */
class Form extends Register {
  /**
   * Attaches to specified element text or/and icon and disables it.
   * @param element
   * @param text
   * @param animatedIcon
   * @private
   */
  private static _setPreloader(element: HTMLElement, text?: string, animatedIcon?: string) {
    element.textContent = `${animatedIcon ? animatedIcon : ''}${text ? text : ''}`;
    // @ts-ignore
    element.disabled = true;
  }

  /**
   * Finds submit button, disable it and set preloader text or / and icon.
   * @private
   */
  private static _disableSubmitButton() {
    const inputSubmit = document.querySelector('input[type="submit"]');
    const buttonSubmit = document.querySelector('button[type="submit"]');
    // @ts-ignore
    // tslint:disable-next-line:no-unused-expression
    inputSubmit && Form._setPreloader(inputSubmit, Language.translations.PRELOADER_TEXT);
    // @ts-ignore
    // tslint:disable-next-line:no-unused-expression
    buttonSubmit && Form._setPreloader(buttonSubmit, Language.translations.PRELOADER_TEXT);
  }

  private cardNumberMounted: HTMLElement;
  private expirationDateMounted: HTMLElement;
  private securityCodeMounted: HTMLElement;
  private animatedCardMounted: HTMLElement;
  private cardNumber: Element;
  private expirationDate: Element;
  private securityCode: Element;
  private animatedCard: Element;
  private messageBus: MessageBus;
  private messageBusEvent: IMessageBusEvent;

  // TODO do we need all this data on all types
  constructor(jwt: any, origin: any, fieldsIds: [], styles: IStyles) {
    super(jwt, origin, fieldsIds, styles);
    this.messageBus = new MessageBus();
    this._onInit();
  }

  /**
   * Defines form elements for card payments
   */
  public setElementsFields() {
    return [
      this.fieldsIds.cardNumber,
      this.fieldsIds.expirationDate,
      this.fieldsIds.securityCode,
      this.fieldsIds.animatedCard
    ];
  }

  public _onInit() {
    if (!this.onlyWallets) {
      this.initCardFields();
      this._setFormListener();
    }
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

    this.cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles, { ...this.params, origin: this.origin });
    this.cardNumberMounted = this.cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this.cardNumberMounted);

    this.expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles, this.params);
    this.expirationDateMounted = this.expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this.expirationDateMounted);

    this.securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles, this.params);
    this.securityCodeMounted = this.securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this.securityCodeMounted);

    this.animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME, {}, this.params);
    this.animatedCardMounted = this.animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME);
    this.elementsToRegister.push(this.animatedCardMounted);
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
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      Form._disableSubmitButton();
      this.messageBus.publishFromParent(this.messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
    });
  }
}

export default Form;

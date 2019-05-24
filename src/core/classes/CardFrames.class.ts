import Element from '../Element';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';
import RegisterFrames from './RegisterFrames.class';
import Validation from '../shared/Validation';
import DomMethods from '../shared/DomMethods';

/**
 * Defines all card elements of form and their  placement on merchant site.
 */
export default class CardFrames extends RegisterFrames {
  private cardNumberMounted: HTMLElement;
  private expirationDateMounted: HTMLElement;
  private securityCodeMounted: HTMLElement;
  private animatedCardMounted: HTMLElement;
  private cardNumber: Element;
  private expirationDate: Element;
  private securityCode: Element;
  private animatedCard: Element;
  private messageBus: MessageBus;
  private validation: Validation;

  constructor(jwt: any, origin: any, componentIds: [], styles: IStyles) {
    super(jwt, origin, componentIds, styles);
    this.validation = new Validation();
    this.messageBus = new MessageBus();
    this._initSubscribes();
    this._onInit();
  }

  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS = 'st-button-submit__disabled';

  /**
   * Sets button properties as text and disable/enable class
   * @param element
   * @param disabledState
   * @private
   */
  private static _setSubmitButtonProperties(element: any, disabledState: boolean) {
    if (disabledState) {
      element.textContent = Language.translations.PROCESSING;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
    } else {
      element.textContent = Language.translations.PAY;
      element.classList.remove(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
    }

    // @ts-ignore
    element.disabled = disabledState;
    return element;
  }

  /**
   * Gets submit button whether is input or button markup.
   */
  private static getSubmitButton = () =>
    document.querySelector(CardFrames.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
    document.querySelector(CardFrames.SUBMIT_BUTTON_AS_INPUT_MARKUP);

  /**
   * Finds submit button whether is input or button markup and sets properties.
   * @param state
   */
  public static disableSubmitButton(state: boolean) {
    const element = CardFrames.getSubmitButton();
    element && CardFrames._setSubmitButtonProperties(element, state);
  }

  public disableFormField(state: boolean, eventName: string) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName
    };
    this.messageBus.publish(messageBusEvent);
  }

  /**
   * Defines form elements for card payments
   */
  public setElementsFields() {
    return [
      this.componentIds.cardNumber,
      this.componentIds.expirationDate,
      this.componentIds.securityCode,
      this.componentIds.animatedCard
    ];
  }

  /**
   * Inits all methods with Message Bus subscribe and eventListeners.
   */
  private _initSubscribes() {
    this.submitFormListener();
    this.subscribeBlockSubmit();
    this.validateFieldsAfterSubmit();
    this._setMerchantInputListeners();
  }

  /**
   *
   */
  public _onInit() {
    if (!this.onlyWallets) {
      this.initCardFields();
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
   * Publishes UPDATE_MERCHANT_FIELDS event to Message Bus.
   */
  private onInput() {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Binds all the form inputs and listen to onInput event.
   * @private
   */
  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
    for (const el of els) {
      el.addEventListener('input', this.onInput.bind(this));
    }
  }

  /**
   * Listens to html submit form event, blocks default event, disables submit button and publish event to Message Bus.
   */
  private submitFormListener() {
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      this.publishSubmitEvent();
    });
  }

  /**
   * Checks if submit button needs to be blocked.
   */
  private subscribeBlockSubmit() {
    this.messageBus.subscribe(MessageBus.EVENTS.BLOCK_FORM, (data: any) => {
      CardFrames.disableSubmitButton(data.state);
      this.disableFormField(data.state, MessageBus.EVENTS.BLOCK_CARD_NUMBER);
      this.disableFormField(data.state, MessageBus.EVENTS.BLOCK_EXPIRATION_DATE);
      this.disableFormField(data.state, MessageBus.EVENTS.BLOCK_SECURITY_CODE);
    });
  }

  /**
   * Publishes message bus submit event.
   */
  private publishSubmitEvent() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this.messageBus.publish(messageBusEvent);
  }

  /**
   *
   */
  private validateFieldsAfterSubmit() {
    this.messageBus.subscribe(MessageBus.EVENTS.VALIDATE_FORM, (data: any) => {
      const { cardNumber, expirationDate, securityCode } = data;
      let messageBusEvent: IMessageBusEvent = { data: 'test', type: '' };
      if (!cardNumber) {
        messageBusEvent.type = MessageBus.EVENTS.FOCUS_CARD_NUMBER;
        this.messageBus.publish(messageBusEvent);
      }
      if (!expirationDate) {
        messageBusEvent.type = MessageBus.EVENTS.FOCUS_EXPIRATION_DATE;
        this.messageBus.publish(messageBusEvent);
      }
      if (!securityCode) {
        messageBusEvent.type = MessageBus.EVENTS.FOCUS_SECURITY_CODE;
        this.messageBus.publish(messageBusEvent);
      }
    });
  }
}

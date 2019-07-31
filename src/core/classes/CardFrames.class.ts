import Element from '../Element';
import { IValidationMessageBus } from '../models/Validation';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';
import { Translator } from '../shared/Translator';
import Validation from '../shared/Validation';
import RegisterFrames from './RegisterFrames.class';

/**
 * Defines all card elements of form and their placement on merchant site.
 */
class CardFrames extends RegisterFrames {
  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS = 'st-button-submit__disabled';

  private _animatedCardMounted: HTMLElement;
  private _cardNumberMounted: HTMLElement;
  private _expirationDateMounted: HTMLElement;
  private _securityCodeMounted: HTMLElement;
  private _animatedCard: Element;
  private _cardNumber: Element;
  private _expirationDate: Element;
  private _securityCode: Element;
  private _messageBus: MessageBus;
  private _messageBusEvent: IMessageBusEvent = { data: { message: '' }, type: '' };
  private readonly _paymentTypes: string[];
  private readonly _defaultPaymentType: string;
  private _validation: Validation;
  private _translator: Translator;
  private _payMessage: string;
  private _processingMessage: string;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    paymentTypes: string[],
    defaultPaymentType: string
  ) {
    super(jwt, origin, componentIds, styles);
    this._paymentTypes = paymentTypes;
    this._defaultPaymentType = defaultPaymentType;
    this._validation = new Validation();
    this._messageBus = new MessageBus();
    this._initSubscribes();
    this.onInit();
    this._translator = new Translator(this.params.locale);
    this._getSubmitButton();
    this._payMessage = this._translator.translate(Language.translations.PAY);
    this._processingMessage = `${this._translator.translate(Language.translations.PROCESSING)} ...`;
  }

  /**
   * Gathers and launches methods needed on initializing object.
   */
  protected onInit() {
    this._initCardFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  protected registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  /**
   * Defines form elements for card payments
   */
  protected setElementsFields() {
    return [
      this.componentIds.cardNumber,
      this.componentIds.expirationDate,
      this.componentIds.securityCode,
      this.componentIds.animatedCard
    ];
  }

  /**
   *
   * @param state
   * @param eventName
   * @private
   */
  private _disableFormField(state: boolean, eventName: string) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Finds submit button whether is input or button markup and sets properties.
   * @param state
   * @private
   */
  private _disableSubmitButton(state: boolean) {
    const element = this._getSubmitButton();
    return element && this._setSubmitButtonProperties(element, state);
  }

  /**
   * Gets submit button whether is input or button markup.
   */
  private _getSubmitButton = () => {
    const button =
      document.querySelector(CardFrames.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
      document.querySelector(CardFrames.SUBMIT_BUTTON_AS_INPUT_MARKUP);
    button.textContent = this._translator.translate(Language.translations.PAY);
    return button;
  };

  /**
   * Inits credit card and animated card fields (if merchant wanted this type of payment)
   */
  private _initCardFields() {
    this._cardNumber = new Element();
    this._expirationDate = new Element();
    this._securityCode = new Element();
    this._animatedCard = new Element();

    this._cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles, { ...this.params, origin: this.origin });
    this._cardNumberMounted = this._cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this._cardNumberMounted);

    this._expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles, this.params);
    this._expirationDateMounted = this._expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this._expirationDateMounted);

    this._securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles, this.params);
    this._securityCodeMounted = this._securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this._securityCodeMounted);

    const animatedCardConfig = { ...this.params };
    if (this._paymentTypes !== undefined) {
      animatedCardConfig.paymentTypes = this._paymentTypes;
    }
    if (this._defaultPaymentType !== undefined) {
      animatedCardConfig.defaultPaymentType = this._defaultPaymentType;
    }

    this._animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME, {}, animatedCardConfig);
    this._animatedCardMounted = this._animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME, '-1');
    this.elementsToRegister.push(this._animatedCardMounted);
  }

  /**
   * Inits all methods with Message Bus subscribe and eventListeners.
   */
  private _initSubscribes() {
    this._submitFormListener();
    this._subscribeBlockSubmit();
    this._validateFieldsAfterSubmit();
    this._setMerchantInputListeners();
  }

  /**
   * Publishes UPDATE_MERCHANT_FIELDS event to Message Bus.
   */
  private _onInput() {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Binds all the form inputs and listen to onInput event.
   * @private
   */
  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  /**
   * Listens to html submit form event, blocks default event, disables submit button and publish event to Message Bus.
   */
  private _submitFormListener() {
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      this._publishSubmitEvent();
    });
  }

  /**
   * Checks if submit button needs to be blocked.
   */
  private _subscribeBlockSubmit() {
    this._messageBus.subscribe(MessageBus.EVENTS.BLOCK_FORM, (data: boolean) => {
      this._disableSubmitButton(data);
      this._disableFormField(data, MessageBus.EVENTS.BLOCK_CARD_NUMBER);
      this._disableFormField(data, MessageBus.EVENTS.BLOCK_EXPIRATION_DATE);
      this._disableFormField(data, MessageBus.EVENTS.BLOCK_SECURITY_CODE);
    });
  }

  /**
   * Publishes message bus submit event.
   */
  private _publishSubmitEvent() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this._messageBus.publish(messageBusEvent);
  }

  /**
   * Validates all merchant form inputs after submit action.
   */
  private _validateFieldsAfterSubmit() {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_FORM, (data: IValidationMessageBus) => {
      const { cardNumber, expirationDate, securityCode } = data;
      if (!cardNumber.state) {
        this._publishValidatedFieldState(cardNumber, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
      }
      if (!expirationDate.state) {
        this._publishValidatedFieldState(expirationDate, MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
      }
      if (!securityCode.state) {
        this._publishValidatedFieldState(securityCode, MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD);
      }
    });
  }

  /**
   * Publishes validated event to MessageBus.
   * @param field
   * @param eventType
   * @private
   */
  private _publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string) {
    this._messageBusEvent.type = eventType;
    this._messageBusEvent.data.message = field.message;
    this._messageBus.publish(this._messageBusEvent);
  }

  /**
   * Sets button properties as text and disable/enable class
   * @param element
   * @param disabledState
   * @private
   */
  private _setSubmitButtonProperties(element: any, disabledState: boolean) {
    if (disabledState) {
      element.textContent = this._processingMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
    } else {
      element.textContent = this._payMessage;
      element.classList.remove(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
    }
    element.disabled = disabledState;
    return element;
  }
}

export default CardFrames;

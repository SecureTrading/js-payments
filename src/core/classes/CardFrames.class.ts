import JwtDecode from 'jwt-decode';
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
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static ON_SUBMIT_ACTION: string = 'onsubmit';
  private static PREVENT_DEFAULT_EVENT: string = 'event.preventDefault()';
  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP: string = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP: string = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS: string = 'st-button-submit__disabled';

  private static _preventFormSubmit() {
    return document
      .getElementById(Selectors.MERCHANT_FORM_SELECTOR)
      .setAttribute(CardFrames.ON_SUBMIT_ACTION, CardFrames.PREVENT_DEFAULT_EVENT);
  }

  private _animatedCardMounted: HTMLElement;
  private _cardNumberMounted: HTMLElement;
  private _expirationDateMounted: HTMLElement;
  private _securityCodeMounted: HTMLElement;
  private _animatedCard: Element;
  private _cardNumber: Element;
  private _expirationDate: Element;
  private _securityCode: Element;
  private _validation: Validation;
  private _translator: Translator;
  private _messageBusEvent: IMessageBusEvent = { data: { message: '' }, type: '' };
  private _submitButton: HTMLInputElement | HTMLButtonElement;
  private _cardType: boolean;
  private _buttonId: string;
  private _deferInit: boolean;
  private _defaultPaymentType: string;
  private _paymentTypes: string[];
  private _payMessage: string;
  private _processingMessage: string;
  private _startOnLoad: boolean;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    paymentTypes: string[],
    defaultPaymentType: string,
    animatedCard: boolean,
    deferInit: boolean,
    buttonId: string,
    startOnLoad: boolean,
    fieldsToSubmit: string[]
  ) {
    super(jwt, origin, componentIds, styles, animatedCard, fieldsToSubmit);
    this._setInitValues(
      animatedCard,
      buttonId,
      defaultPaymentType,
      deferInit,
      jwt,
      fieldsToSubmit,
      paymentTypes,
      startOnLoad
    );
    this.onInit();
  }

  protected _setInitValues(
    animatedCard: boolean,
    buttonId: string,
    defaultPaymentType: string,
    deferInit: boolean,
    jwt: string,
    fieldsToSubmit: string[],
    paymentTypes: any,
    startOnLoad: boolean
  ) {
    this._validation = new Validation();
    this._translator = new Translator(this.params.locale);
    this._buttonId = buttonId;
    this._deferInit = deferInit;
    this._startOnLoad = startOnLoad;
    this._defaultPaymentType = defaultPaymentType;
    this._paymentTypes = paymentTypes;
    this._payMessage = this._translator.translate(Language.translations.PAY);
    this._processingMessage = `${this._translator.translate(Language.translations.PROCESSING)} ...`;
  }

  /**
   * Broadcast security code length when there is only one field
   * to be submit (cvv/cvc) and rest of them are in jwt.
   * @param jwt
   * @private
   */
  protected _broadcastSecurityCodeProperties(jwt: string) {
    this._cardType = CardFrames.NO_CVV_CARDS.includes(this._getCardType(jwt));
    const messageBusEvent: IMessageBusEvent = {
      data: this._getSecurityCodeLength(jwt),
      type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
    };
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT, (data: any) => {
      if (!data.initReload) {
        this.messageBus.publish(messageBusEvent);
      }
    });
  }

  protected onInit() {
    this._deferJsinitOnLoad();
    CardFrames._preventFormSubmit();
    this._setSubmitButton();
    this._initSubscribes();
    this._initCardFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
    this._broadcastSecurityCodeProperties(this.jwt);
  }

  /**
   * Registers and appends elements in users form.
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
  protected setElementsFields(jwt?: string) {
    if (this.hasAnimatedCard) {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
        this.componentIds.animatedCard
      ];
    } else if (jwt && this._getCardType(jwt) === 'PIBA') {
      if (this.fieldsToSubmit) {
        const components: string[] = [];
        if (this.fieldsToSubmit.length) {
          if (this.fieldsToSubmit.includes('pan')) {
            components.push(this.componentIds.cardNumber);
          }
          if (this.fieldsToSubmit.includes('expirydate')) {
            components.push(this.componentIds.expirationDate);
          }
        }
        return components;
      }
    } else {
      if (this.fieldsToSubmit) {
        const components: string[] = [];
        if (this.fieldsToSubmit.length) {
          if (this.fieldsToSubmit.includes('pan')) {
            components.push(this.componentIds.cardNumber);
          }
          if (this.fieldsToSubmit.includes('expirydate')) {
            components.push(this.componentIds.expirationDate);
          }
          if (this.fieldsToSubmit.includes('securitycode')) {
            components.push(this.componentIds.securityCode);
          }
        } else {
          components.push(this.componentIds.cardNumber);
          components.push(this.componentIds.expirationDate);
          components.push(this.componentIds.securityCode);
        }
        return components;
      } else {
        return [this.componentIds.cardNumber, this.componentIds.expirationDate, this.componentIds.securityCode];
      }
    }
  }

  /**
   * Gets security code length based on BinLookup search.
   * Method used in this class when there is only one field to be submit.
   * @param jwt
   * @private
   */
  private _getSecurityCodeLength(jwt: string): number {
    const cardDetails = JwtDecode(jwt) as any;
    if (cardDetails.payload.pan) {
      const { cvcLength } = this.binLookup.binLookup(cardDetails.payload.pan);
      return cvcLength.slice(-1)[0];
    }
  }

  private _getCardType(jwt: string): string {
    const cardDetails = JwtDecode(jwt) as any;
    if (cardDetails.payload.pan) {
      return this.binLookup.binLookup(cardDetails.payload.pan).type;
    }
  }

  private _deferJsinitOnLoad() {
    if (!this._deferInit && this._startOnLoad) {
      this._publishSubmitEvent(true);
    }
  }

  private _disableFormField(state: boolean, eventName: string) {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName
    };
    this.messageBus.publish(messageBusEvent);
  }

  /**
   * Finds submit button whether is input or button markup and sets properties.
   * @param state
   * @private
   */
  private _disableSubmitButton(state: boolean) {
    const button: HTMLButtonElement | HTMLInputElement = document.getElementById(this._buttonId) as
      | HTMLButtonElement
      | HTMLInputElement;
    if (button) {
      this._setSubmitButtonProperties(button, state);
    }
  }

  /**
   * Sets submit button whether is input or button markup.
   * Chooses between specified by merchant or default one.
   */
  private _setSubmitButton = () => {
    const form = document.getElementById(Selectors.MERCHANT_FORM_SELECTOR);
    let button: HTMLInputElement | HTMLButtonElement = this._buttonId
      ? (document.getElementById(this._buttonId) as HTMLButtonElement | HTMLInputElement)
      : null;
    if (!button) {
      button =
        form.querySelector(CardFrames.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
        form.querySelector(CardFrames.SUBMIT_BUTTON_AS_INPUT_MARKUP);
    }
    button.textContent = this._payMessage;
    this._submitButton = button;
    return button;
  };

  /**
   * Inits credit card and animated card fields (if merchant wanted this type of payment)
   */
  private _initCardFields() {
    const { defaultStyles } = this.styles;
    let { cardNumber, securityCode, expirationDate } = this.styles;
    cardNumber = Object.assign({}, defaultStyles, cardNumber);
    securityCode = Object.assign({}, defaultStyles, securityCode);
    expirationDate = Object.assign({}, defaultStyles, expirationDate);

    if (this.fieldsToSubmit) {
      if (this.fieldsToSubmit.length) {
        if (this.fieldsToSubmit.includes('pan')) {
          this._cardNumber = new Element();
          this._cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, cardNumber, this.params);
          this._cardNumberMounted = this._cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
          this.elementsToRegister.push(this._cardNumberMounted);
        }
        if (this.fieldsToSubmit.includes('expirydate')) {
          this._expirationDate = new Element();
          this._expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, expirationDate, this.params);
          this._expirationDateMounted = this._expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
          this.elementsToRegister.push(this._expirationDateMounted);
        }
        if (this.fieldsToSubmit.includes('securitycode')) {
          this._securityCode = new Element();
          this._securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, securityCode, this.params);
          this._securityCodeMounted = this._securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
          this.elementsToRegister.push(this._securityCodeMounted);
        }
      } else {
        this._cardNumber = new Element();
        this._expirationDate = new Element();
        this._securityCode = new Element();
        this._animatedCard = new Element();

        this._cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, cardNumber, this.params);
        this._cardNumberMounted = this._cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
        this.elementsToRegister.push(this._cardNumberMounted);

        this._expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, expirationDate, this.params);
        this._expirationDateMounted = this._expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
        this.elementsToRegister.push(this._expirationDateMounted);

        this._securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, securityCode, this.params);
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
    } else {
      this._cardNumber = new Element();
      this._expirationDate = new Element();
      this._securityCode = new Element();
      this._animatedCard = new Element();

      this._cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, cardNumber, this.params);
      this._cardNumberMounted = this._cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
      this.elementsToRegister.push(this._cardNumberMounted);

      this._expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, expirationDate, this.params);
      this._expirationDateMounted = this._expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
      this.elementsToRegister.push(this._expirationDateMounted);

      this._securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, securityCode, this.params);
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
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
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
    this._submitButton.addEventListener('click', () => {
      this._publishSubmitEvent(this._deferInit);
    });
    this.messageBus.subscribeOnParent(MessageBus.EVENTS.CALL_SUBMIT_EVENT, () => {
      this._publishSubmitEvent(this._deferInit);
    });
  }

  /**
   * Checks if submit button needs to be blocked.
   */
  private _subscribeBlockSubmit() {
    this.messageBus.subscribe(MessageBus.EVENTS.BLOCK_FORM, (state: boolean) => {
      this._disableSubmitButton(state);
      this._disableFormField(state, MessageBus.EVENTS.BLOCK_CARD_NUMBER);
      this._disableFormField(state, MessageBus.EVENTS.BLOCK_EXPIRATION_DATE);
      this._disableFormField(state, MessageBus.EVENTS.BLOCK_SECURITY_CODE);
    });
  }

  /**
   * Publishes message bus submit event.
   */
  private _publishSubmitEvent(deferInit: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: { deferInit, fieldsToSubmit: this.fieldsToSubmit },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Validates all merchant form inputs after submit action.
   */
  private _validateFieldsAfterSubmit() {
    this.messageBus.subscribe(MessageBus.EVENTS.VALIDATE_FORM, (data: IValidationMessageBus) => {
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
    this.messageBus.publish(this._messageBusEvent);
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

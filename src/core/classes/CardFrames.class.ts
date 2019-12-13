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
  private static CARD_NUMBER_FIELD_NAME: string = 'pan';
  private static COMPLETE_FORM_NUMBER_OF_FIELDS: number = 3;
  private static EXPIRY_DATE_FIELD_NAME: string = 'expirydate';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static ONLY_CVV_NUMBER_OF_FIELDS: number = 1;
  private static ON_SUBMIT_ACTION: string = 'onsubmit';
  private static PREVENT_DEFAULT_EVENT: string = 'event.preventDefault()';
  private static SECURITY_CODE_FIELD_NAME: string = 'securitycode';
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
  private _buttonId: string;
  private _deferInit: boolean;
  private _defaultPaymentType: string;
  private _paymentTypes: string[];
  private _payMessage: string;
  private _processingMessage: string;
  private _startOnLoad: boolean;
  private _fieldsToSubmitLength: number;
  private _isCardWithNoCvv: boolean;
  private _noFieldConfiguration: boolean;
  private _onlyCvvConfiguration: boolean;
  private _configurationForStandardCard: boolean;

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
    this._setInitValues(buttonId, defaultPaymentType, deferInit, paymentTypes, startOnLoad);
    this.configureFormFieldsAmount(jwt);
    this.setElementsFields();
    this.onInit();
  }

  protected onInit() {
    this._deferJsinitOnLoad();
    CardFrames._preventFormSubmit();
    this._createSubmitButton();
    this._initSubscribes();
    this._initCardFrames();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
    this._broadcastSecurityCodeProperties(this.jwt);
  }

  /**
   * Checks how any inputs there are configured (1 or 3) and specified the type of card indicated.
   * @param jwt
   * @private
   */
  protected configureFormFieldsAmount(jwt: string) {
    this._fieldsToSubmitLength = this.fieldsToSubmit.length;
    this._isCardWithNoCvv = jwt && CardFrames.NO_CVV_CARDS.includes(this._getCardType(jwt));
    this._noFieldConfiguration =
      this._fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this._onlyCvvConfiguration =
      this._fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this._configurationForStandardCard =
      this._fieldsToSubmitLength === CardFrames.COMPLETE_FORM_NUMBER_OF_FIELDS &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.CARD_NUMBER_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.EXPIRY_DATE_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
  }

  /**
   * Registers and appends elements in users form.
   * @param fields
   * @param targets
   */
  protected registerElements(fields: HTMLElement[], targets: string[]) {
    if (fields.length && targets.length) {
      targets.map((item, index) => {
        document.getElementById(item).appendChild(fields[index]);
      });
    }
  }

  /**
   * Defines form elements for card payments
   */
  protected setElementsFields() {
    if (this._configurationForStandardCard) {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
        this.componentIds.animatedCard
      ];
    } else if (this._onlyCvvConfiguration) {
      return [this.componentIds.securityCode];
    } else if (this._noFieldConfiguration) {
      return [];
    } else {
      return false;
    }
  }

  /**
   * Broadcast security code length when there is only one field
   * to be submit (cvv/cvc) and rest of them are in jwt.
   * @param jwt
   * @private
   */
  private _broadcastSecurityCodeProperties(jwt: string) {
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

  /**
   * Creates submit button whether is input or button markup.
   * Chooses between specified by merchant or default one.
   */
  private _createSubmitButton = () => {
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

  private _getCardType(jwt: string): string {
    const cardDetails = JwtDecode(jwt) as any;
    if (cardDetails.payload.pan) {
      return this.binLookup.binLookup(cardDetails.payload.pan).type;
    }
  }

  private _getSecurityCodeLength(jwt: string): number {
    const cardDetails = JwtDecode(jwt) as any;
    if (cardDetails.payload.pan) {
      const { cvcLength } = this.binLookup.binLookup(cardDetails.payload.pan);
      return cvcLength.slice(-1)[0];
    }
  }

  private _initCardNumberFrame(styles: {}) {
    this._cardNumber = new Element();
    this._cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, styles, this.params);
    this._cardNumberMounted = this._cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this._cardNumberMounted);
  }

  private _initExpiryDateFrame(styles: {}) {
    this._expirationDate = new Element();
    this._expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, styles, this.params);
    this._expirationDateMounted = this._expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this._expirationDateMounted);
  }

  private _initSecurityCodeFrame(styles: {}) {
    this._securityCode = new Element();
    this._securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, styles, this.params);
    this._securityCodeMounted = this._securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this._securityCodeMounted);
  }

  private _initAnimatedCardFrame() {
    console.error(this._configurationForStandardCard);
    this._animatedCard = new Element();
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

  private _initCardFrames() {
    const { defaultStyles } = this.styles;
    let { cardNumber, securityCode, expirationDate } = this.styles;
    cardNumber = Object.assign({}, defaultStyles, cardNumber);
    securityCode = Object.assign({}, defaultStyles, securityCode);
    expirationDate = Object.assign({}, defaultStyles, expirationDate);

    if (this._onlyCvvConfiguration) {
      this._initSecurityCodeFrame(securityCode);
    } else if (this._configurationForStandardCard) {
      this._initCardNumberFrame(cardNumber);
      this._initExpiryDateFrame(expirationDate);
      this._initSecurityCodeFrame(securityCode);
      this._initAnimatedCardFrame();
    } else {
      return false;
    }
  }

  private _initSubscribes() {
    this._submitFormListener();
    this._subscribeBlockSubmit();
    this._validateFieldsAfterSubmit();
    this._setMerchantInputListeners();
  }

  private _onInput() {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _publishSubmitEvent(deferInit: boolean) {
    const messageBusEvent: IMessageBusEvent = {
      data: { deferInit, fieldsToSubmit: this.fieldsToSubmit },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string) {
    this._messageBusEvent.type = eventType;
    this._messageBusEvent.data.message = field.message;
    this.messageBus.publish(this._messageBusEvent);
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

  private _setInitValues(
    buttonId: string,
    defaultPaymentType: string,
    deferInit: boolean,
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
}

export default CardFrames;

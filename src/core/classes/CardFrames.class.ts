import JwtDecode from 'jwt-decode';
import { BypassCards } from '../models/constants/BypassCards';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IStyles } from '../models/IStyles';
import { IValidationMessageBus } from '../models/IValidationMessageBus';
import { Element } from '../services/Element';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Selectors } from '../shared/Selectors';
import { Translator } from '../shared/Translator';
import { Validation } from '../shared/Validation';
import { RegisterFrames } from './RegisterFrames.class';
import { iinLookup } from '@securetrading/ts-iin-lookup';

export class CardFrames extends RegisterFrames {
  private static CARD_NUMBER_FIELD_NAME: string = 'pan';
  private static CLICK_EVENT: string = 'click';
  private static COMPLETE_FORM_NUMBER_OF_FIELDS: number = 3;
  private static EXPIRY_DATE_FIELD_NAME: string = 'expirydate';
  private static INPUT_EVENT: string = 'input';
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
  private _loadAnimatedCard: boolean;
  private _bypassCards: BypassCards[];

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
    fieldsToSubmit: string[],
    bypassCards: BypassCards[]
  ) {
    super(jwt, origin, componentIds, styles, animatedCard, fieldsToSubmit);
    this._setInitValues(
      buttonId,
      defaultPaymentType,
      deferInit,
      paymentTypes,
      startOnLoad,
      animatedCard,
      bypassCards,
      jwt
    );
    this.configureFormFieldsAmount(jwt);
  }

  public init() {
    this._deferJsinitOnLoad();
    CardFrames._preventFormSubmit();
    this._createSubmitButton();
    this._initSubscribes();
    this._initCardFrames();
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  protected configureFormFieldsAmount(jwt: string): void {
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
      this._loadAnimatedCard &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.CARD_NUMBER_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.EXPIRY_DATE_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
  }

  protected registerElements(fields: HTMLElement[], targets: string[]): void {
    if (fields.length === targets.length) {
      targets.forEach((item, index) => {
        const element: HTMLElement = document.getElementById(item);
        try {
          element.appendChild(fields[index]);
        } catch {
          throw new Error(this._translator.translate(Language.translations.TARGET_ELEMENT_IS_NOT_SPECIFIED));
        }
      });
    }
  }

  protected setElementsFields(): string[] {
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
      return [
        this.componentIds.cardNumber, //
        this.componentIds.expirationDate,
        this.componentIds.securityCode
      ];
    }
  }

  private _createSubmitButton = (): HTMLInputElement | HTMLButtonElement => {
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

  private _deferJsinitOnLoad(): void {
    if (!this._deferInit && this._startOnLoad) {
      this._publishSubmitEvent(true);
    }
  }

  private _disableFormField(state: boolean, eventName: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _disableSubmitButton(state: boolean): void {
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
      return iinLookup.lookup(cardDetails.payload.pan).type;
    }
  }

  private _getSecurityCodeLength(jwt: string): number {
    const cardDetails = JwtDecode(jwt) as any;
    if (cardDetails.payload.pan) {
      const { cvcLength } = iinLookup.lookup(cardDetails.payload.pan);
      return cvcLength.slice(-1)[0];
    }
  }

  private _initCardNumberFrame(styles: {}): void {
    this._cardNumber = new Element();
    this._cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, styles, this.params);
    this._cardNumberMounted = this._cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this._cardNumberMounted);
  }

  private _initExpiryDateFrame(styles: {}): void {
    this._expirationDate = new Element();
    this._expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, styles, this.params);
    this._expirationDateMounted = this._expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this._expirationDateMounted);
  }

  private _initSecurityCodeFrame(styles: {}): void {
    this._securityCode = new Element();
    this._securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, styles, this.params);
    this._securityCodeMounted = this._securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this._securityCodeMounted);
  }

  private _initAnimatedCardFrame(): void {
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

  private _initCardFrames(): void {
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
      this._initCardNumberFrame(cardNumber);
      this._initExpiryDateFrame(expirationDate);
      this._initSecurityCodeFrame(securityCode);
    }
  }

  private _initSubscribes(): void {
    this._submitFormListener();
    this._subscribeBlockSubmit();
    this._validateFieldsAfterSubmit();
    this._setMerchantInputListeners();
  }

  private _onInput(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _publishSubmitEvent(deferInit: boolean): void {
    const messageBusEvent: IMessageBusEvent = {
      data: {
        bypassCards: this._bypassCards,
        deferInit,
        fieldsToSubmit: this.fieldsToSubmit
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string): void {
    this._messageBusEvent.type = eventType;
    this._messageBusEvent.data.message = field.message;
    this.messageBus.publish(this._messageBusEvent);
  }

  private _setMerchantInputListeners(): void {
    const els = DomMethods.getAllFormElements(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
    for (const el of els) {
      el.addEventListener(CardFrames.INPUT_EVENT, this._onInput.bind(this));
    }
  }

  private _setInitValues(
    buttonId: string,
    defaultPaymentType: string,
    deferInit: boolean,
    paymentTypes: any,
    startOnLoad: boolean,
    loadAnimatedCard: boolean,
    bypassCards: BypassCards[],
    jwt: string
  ): void {
    this._validation = new Validation();
    this._translator = new Translator(this.params.locale);
    this._buttonId = buttonId;
    this._deferInit = deferInit;
    this._startOnLoad = startOnLoad;
    this._defaultPaymentType = defaultPaymentType;
    this._paymentTypes = paymentTypes;
    this._bypassCards = bypassCards;
    this.jwt = jwt;
    this._payMessage = this._translator.translate(Language.translations.PAY);
    this._processingMessage = `${this._translator.translate(Language.translations.PROCESSING)} ...`;
    this._loadAnimatedCard = loadAnimatedCard !== undefined ? loadAnimatedCard : true;
  }

  private _setSubmitButtonProperties(element: any, disabledState: boolean): HTMLElement {
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

  private _submitFormListener(): void {
    this._submitButton.addEventListener(CardFrames.CLICK_EVENT, () => {
      this._publishSubmitEvent(this._deferInit);
    });
    this.messageBus.subscribeOnParent(MessageBus.EVENTS.CALL_SUBMIT_EVENT, () => {
      this._publishSubmitEvent(this._deferInit);
    });
  }

  private _subscribeBlockSubmit(): void {
    this.messageBus.subscribe(MessageBus.EVENTS.BLOCK_FORM, (state: boolean) => {
      this._disableSubmitButton(state);
      this._disableFormField(state, MessageBus.EVENTS.BLOCK_CARD_NUMBER);
      this._disableFormField(state, MessageBus.EVENTS.BLOCK_EXPIRATION_DATE);
      this._disableFormField(state, MessageBus.EVENTS.BLOCK_SECURITY_CODE);
    });
  }

  private _validateFieldsAfterSubmit(): void {
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

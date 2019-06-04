import BinLookup from '../../core/shared/BinLookup';
import DOMMethods from '../../core/shared/DomMethods';
import Frame from '../../core/shared/Frame';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { Translator } from '../../core/shared/Translator';
import { ICardDetails, ISubscribeObject } from './animated-card-interfaces';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 * TODO: In not distant future it'll be refactored to standalone version available to work with library.
 */
class AnimatedCard extends Frame {
  // @ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  private static CARD_TYPES = {
    AMEX: 'amex',
    ASTROPAYCARD: 'astropaycard',
    DEFAULT: 'default',
    DINERS: 'diners',
    DISCOVER: 'discover',
    JCB: 'jcb',
    MAESTRO: 'maestro',
    MASTERCARD: 'mastercard',
    PIBA: 'piba',
    VISA: 'visa'
  };

  private static CARD_COMPONENT_CLASS = 'st-animated-card';
  private static CARD_CLASSES = {
    CLASS_BACK: `${AnimatedCard.CARD_COMPONENT_CLASS}__back`,
    CLASS_FOR_ANIMATION: `${AnimatedCard.CARD_COMPONENT_CLASS}__flip-card`,
    CLASS_FRONT: `${AnimatedCard.CARD_COMPONENT_CLASS}__front`,
    CLASS_LOGO: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo`,
    CLASS_LOGO_DEFAULT: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo--default`,
    CLASS_LOGO_IMAGE: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo-img`,
    CLASS_LOGO_WRAPPER: `${AnimatedCard.CARD_COMPONENT_CLASS}-payment-logo`,
    CLASS_SECURITY_CODE_HIDDEN: `${AnimatedCard.CARD_COMPONENT_CLASS}__security-code--front-hidden`,
    CLASS_SIDE: `${AnimatedCard.CARD_COMPONENT_CLASS}__side`
  };
  private static CARD_DETAILS_PLACEHOLDERS = {
    CARD_NUMBER: '\u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219',
    EXPIRATION_DATE: 'MM/YY',
    SECURITY_CODE: '\u2219\u2219\u2219',
    TYPE: 'default'
  };

  private static NOT_FLIPPED_CARDS = [AnimatedCard.CARD_TYPES.AMEX];

  /**
   * Set one of three values on animated card
   * @param value
   * @param placeholder
   */
  private static _setCardDetail = (value: string, placeholder: string) => (value ? value : placeholder);

  /**
   * Getting logo from external js file
   * @param type
   */
  private static _getLogo = (type: string) => cardsLogos[type];

  protected _messageBus: MessageBus;
  private _animatedCardBack: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_BACK);
  private _animatedCardExpirationDate: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_EXPIRATION_DATE_ID
  );
  private _animatedCardFront: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_FRONT);
  private _animatedCardPan: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_ID);
  private _animatedCardSecurityCode: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_ID);
  private _animatedCardSecurityCodeFront: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_ID
  );
  private _animatedCardSecurityCodeFrontField: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_FIELD_ID
  );

  private animatedCardLogoBackground: HTMLElement = document.getElementById(
    AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
  );
  private _binLookup: BinLookup;
  private _cardDetails: ICardDetails = {
    cardNumber: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER,
    expirationDate: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE,
    logo: '',
    securityCode: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE,
    type: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.TYPE
  };
  private _cardElement: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  private _translator: Translator;

  constructor() {
    super();
    this.onInit();
    this._binLookup = new BinLookup();
    this._messageBus = new MessageBus();
    this._translator = new Translator(this._params.locale);
    this._setLabels();
    this._setDefaultInputsValues();
    this._setSubscribeEvents();
  }

  /**
   * Sets labels for all fields of animated card
   * @private
   */
  private _setLabels() {
    this._setLabel(Selectors.ANIMATED_CARD_CREDIT_CARD_LABEL, Language.translations.LABEL_CARD_NUMBER);
    this._setLabel(Selectors.ANIMATED_CARD_EXPIRATION_DATE_LABEL, Language.translations.LABEL_EXPIRATION_DATE);
    this._setLabel(Selectors.ANIMATED_CARD_SECURITY_CODE_LABEL, Language.translations.LABEL_SECURITY_CODE);
  }

  /**
   * Returns theme class for specified theme
   * @param theme
   * @private
   */
  private _returnThemeClass = (theme: string) => `${AnimatedCard.CARD_COMPONENT_CLASS}__${theme}`;

  /**
   * Resets styles on both sides of credit card to default theme
   * @private
   */
  private _resetTheme() {
    this._animatedCardSecurityCodeFrontField.textContent = '';
    this._animatedCardFront.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`
    );
    this._animatedCardBack.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`
    );
  }

  /**
   * Sets theme properties: css settings and card type
   * @private
   */
  private _setThemeClasses() {
    const { type } = this._cardDetails;

    if (type) {
      DOMMethods.removeClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    } else {
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO}`);
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    }
    DOMMethods.addClass(this._animatedCardFront, this._returnThemeClass(type));
    DOMMethods.addClass(this._animatedCardBack, this._returnThemeClass(type));
  }

  /**
   * Sets card logo based on _cardDetails
   * @private
   */
  private _setLogo() {
    const { logo, type } = this._cardDetails;
    if (!document.getElementById(Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID) && logo) {
      const element = DOMMethods.createHtmlElement.apply(this, [
        {
          alt: type,
          class: AnimatedCard.CARD_CLASSES.CLASS_LOGO_IMAGE,
          id: Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID,
          src: logo
        },
        'img'
      ]);
      DOMMethods.appendChildIntoDOM(AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER, element);
      DOMMethods.setProperty.apply(this, ['src', logo, Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID]);
    } else if (logo) {
      DOMMethods.setProperty.apply(this, ['src', logo, Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID]);
    }
    return logo;
  }

  /**
   * Sets card theme according to card brand coming from _binLookup()
   * @private
   */
  private _setTheme() {
    if (this._cardDetails.type === AnimatedCard.CARD_TYPES.AMEX) {
      this._animatedCardSecurityCodeFrontField.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
    }
    this._cardDetails.logo = AnimatedCard._getLogo(this._cardDetails.type);
  }

  /**
   * For particular type of card it sets security code on front side of card
   * @private
   */
  private _setSecurityCodeOnProperSide() {
    const isAmex: boolean = this._cardDetails.type === AnimatedCard.CARD_TYPES.AMEX;
    isAmex
      ? DOMMethods.removeClass(
          this._animatedCardSecurityCodeFront,
          AnimatedCard.CARD_CLASSES.CLASS_SECURITY_CODE_HIDDEN
        )
      : DOMMethods.addClass(this._animatedCardSecurityCodeFront, AnimatedCard.CARD_CLASSES.CLASS_SECURITY_CODE_HIDDEN);

    return isAmex ? this._animatedCardSecurityCodeFrontField : this._animatedCardSecurityCode;
  }

  /**
   * Checks if given card should not be flipped
   * @private
   */
  private _shouldFlipCard() {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(this._cardDetails.type)) {
      if (!this._cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this._flipCard();
      }
    }
  }

  /**
   * Flips card to see details on revers
   * @private
   */
  private _flipCard = () => this._cardElement.classList.add(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION);

  /**
   * Flips back card by clearing classes
   * @private
   */
  private _flipCardBack() {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(this._cardDetails.type)) {
      if (this._cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this._cardElement.setAttribute('class', Selectors.ANIMATED_CARD_INPUT_SELECTOR);
      }
    }
  }

  /**
   * Removes cards logo when it's theme changed  to default
   * @private
   */
  private _removeLogo() {
    DOMMethods.removeChildFromDOM.apply(this, [
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER,
      Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID
    ]);
  }

  /**
   * Sets placeholders for each editable value on card (card number, expiration date, security code)
   * @private
   */
  private _setDefaultInputsValues() {
    this._animatedCardPan.textContent = this._cardDetails.cardNumber;
    this._animatedCardExpirationDate.textContent = this._cardDetails.expirationDate;
    this._setSecurityCodeOnProperSide().textContent = this._cardDetails.securityCode;
  }

  /**
   * Sets card type based on _binLookup request
   * @param cardNumber
   * @private
   */
  private _setCardType(cardNumber: string) {
    const type = this._binLookup.binLookup(cardNumber).type;
    return type ? type.toLowerCase() : type;
  }

  /**
   * Listens to changes coming from Card Number field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   * @private
   */
  private _onCardNumberChanged(data: ISubscribeObject) {
    const { formattedValue, value } = data;
    this._cardDetails.type = this._setCardType(value);
    this._cardDetails.cardNumber = AnimatedCard._setCardDetail(
      formattedValue,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER
    );
    this._animatedCardPan.textContent = this._cardDetails.cardNumber;
    this._flipCardBack();
    this._resetTheme();
    this._setTheme();
    this._removeLogo();
    this._setLogo();
    this._setThemeClasses();
    this._setSecurityCodeOnProperSide().textContent = this._cardDetails.securityCode;
  }

  /**
   * Listens to changes coming from Expiration Date field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   * @private
   */
  private _onExpirationDateChanged(data: ISubscribeObject) {
    const { value } = data;
    this._cardDetails.expirationDate = AnimatedCard._setCardDetail(
      value,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    );
    this._flipCardBack();
    this._animatedCardExpirationDate.textContent = this._cardDetails.expirationDate;
  }

  /**
   * Listens to changes coming from Security Code field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   * @private
   */
  private _onSecurityCodeChanged(data: ISubscribeObject) {
    const { value } = data;
    this._cardDetails.securityCode = AnimatedCard._setCardDetail(
      value,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
    );
    this._shouldFlipCard();
    this._setSecurityCodeOnProperSide().textContent = this._cardDetails.securityCode;
  }

  /**
   * Sets subscribe events on every editable field of card
   * @private
   */
  private _setSubscribeEvents() {
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: ISubscribeObject) => {
      this._onCardNumberChanged(data);
    });
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: ISubscribeObject) =>
      this._onExpirationDateChanged(data)
    );
    this._messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: ISubscribeObject) =>
      this._onSecurityCodeChanged(data)
    );
  }

  /**
   * Sets text of specified label
   * @param labelSelector
   * @param text
   * @private
   */
  private _setLabel(labelSelector: string, text: string) {
    document.getElementById(labelSelector).textContent = this._translator.translate(text);
  }
}

export default AnimatedCard;

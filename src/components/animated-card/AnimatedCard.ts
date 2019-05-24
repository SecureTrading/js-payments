import BinLookup from '../../core/shared/BinLookup';
import DOMMethods from '../../core/shared/DomMethods';
import Frame from '../../core/shared/Frame';
import Language from '../../core/shared/Language';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { Translator } from '../../core/shared/Translator';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 */
class AnimatedCard extends Frame {
  private static SECURITY_CODE_LENGTH_EXTENDED = 4;
  public static CARD_TYPES = {
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

  public static CARD_COMPONENT_CLASS = 'st-animated-card';
  public static CARD_CLASSES = {
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
  public static CARD_DETAILS_PLACEHOLDERS = {
    CARD_NUMBER: '\u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219',
    EXPIRATION_DATE: 'MM/YY',
    SECURITY_CODE: '\u2219\u2219\u2219',
    SECURITY_CODE_EXTENDED: '\u2219\u2219\u2219\u2219',
    TYPE: 'default'
  };

  public static NOT_FLIPPED_CARDS = [AnimatedCard.CARD_TYPES.AMEX];

  // @ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Set one of three values on animated card
   * @param value
   * @param placeholder
   */
  public static setCardDetail = (value: string, placeholder: string) => (value ? value : placeholder);

  /**
   * Getting logo from external js file
   * @param type
   */
  public static getLogo = (type: string) => cardsLogos[type];

  public animatedCardBack: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_BACK);
  public animatedCardExpirationDate: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_ID);
  public animatedCardFront: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_FRONT);
  public animatedCardPan: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_ID);
  public animatedCardSecurityCode: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_ID);
  public animatedCardSecurityCodeFront: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_ID
  );
  public animatedCardSecurityCodeFrontField: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_FIELD_ID
  );

  public animatedCardLogoBackground: HTMLElement = document.getElementById(
    AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
  );
  public binLookup: BinLookup;
  public cardDetails: any = {
    cardNumber: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER,
    expirationDate: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE,
    logo: '',
    securityCode: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE,
    type: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.TYPE
  };
  public cardElement: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  public messageBus: MessageBus;
  private _translator: Translator;

  constructor() {
    super();
    this.onInit();
    this.binLookup = new BinLookup();
    this.messageBus = new MessageBus();
    this._translator = new Translator(this._params.locale);
    this.setLabels();
    this.setDefaultInputsValues();
    this.setSubscribeEvents();
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, (length: number) => {
      this.setSecurityCodePlaceholderContent(length);
    });
  }

  public setSecurityCodePlaceholderContent(securityCodeLength: number) {
    if (securityCodeLength === AnimatedCard.SECURITY_CODE_LENGTH_EXTENDED) {
      this.animatedCardSecurityCodeFrontField.textContent =
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE_EXTENDED;
    } else {
      this.animatedCardSecurityCodeFrontField.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
    }
  }

  public setLabels() {
    this._setLabel(Selectors.ANIMATED_CARD_CREDIT_CARD_LABEL, Language.translations.LABEL_CARD_NUMBER);
    this._setLabel(Selectors.ANIMATED_CARD_EXPIRATION_DATE_LABEL, Language.translations.LABEL_EXPIRATION_DATE);
    this._setLabel(Selectors.ANIMATED_CARD_SECURITY_CODE_LABEL, Language.translations.LABEL_SECURITY_CODE);
  }

  /**
   * Returns theme class for specified theme
   * @param theme
   */
  public returnThemeClass = (theme: string) => `${AnimatedCard.CARD_COMPONENT_CLASS}__${theme}`;

  /**
   * Resets styles on both sides of credit card to default theme
   */
  public resetTheme() {
    this.animatedCardSecurityCodeFrontField.textContent = '';
    this.animatedCardFront.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`
    );
    this.animatedCardBack.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`
    );
  }

  /**
   * Sets theme properties: css settings and card type
   */
  public setThemeClasses() {
    const { type } = this.cardDetails;

    if (type) {
      DOMMethods.removeClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    } else {
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO}`);
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    }
    DOMMethods.addClass(this.animatedCardFront, this.returnThemeClass(type));
    DOMMethods.addClass(this.animatedCardBack, this.returnThemeClass(type));
  }

  /**
   * Sets card logo based on cardDetails
   */
  public setLogo() {
    const { logo, type } = this.cardDetails;
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
   * Sets card theme according to card brand coming from binLookup()
   */
  public setTheme() {
    this.animatedCardSecurityCodeFrontField.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
    if (this.cardDetails.type === AnimatedCard.CARD_TYPES.AMEX) {
      this.animatedCardSecurityCodeFrontField.textContent =
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE_EXTENDED;
    }
    this.cardDetails.logo = AnimatedCard.getLogo(this.cardDetails.type);
  }

  /**
   * For particular type of card it sets security code on front side of card
   */
  public setSecurityCodeOnProperSide() {
    const isAmex: boolean = this.cardDetails.type === AnimatedCard.CARD_TYPES.AMEX;

    if (isAmex) {
      DOMMethods.removeClass(this.animatedCardSecurityCodeFront, AnimatedCard.CARD_CLASSES.CLASS_SECURITY_CODE_HIDDEN);
      this.animatedCardSecurityCodeFrontField.textContent = this.cardDetails.securityCode;
    } else {
      DOMMethods.addClass(this.animatedCardSecurityCodeFront, AnimatedCard.CARD_CLASSES.CLASS_SECURITY_CODE_HIDDEN);
      this.animatedCardSecurityCode.textContent = this.cardDetails.securityCode;
    }
  }

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard() {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(this.cardDetails.type)) {
      if (!this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.flipCard();
      }
    }
  }

  /**
   * Flips card to see details on revers
   */
  public flipCard = () => this.cardElement.classList.add(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION);

  /**
   * Flips back card by clearing classes
   */
  public flipCardBack() {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(this.cardDetails.type)) {
      if (this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.cardElement.setAttribute('class', Selectors.ANIMATED_CARD_INPUT_SELECTOR);
      }
    }
  }

  /**
   * Removes cards logo when it's theme changed  to default
   */
  public removeLogo() {
    DOMMethods.removeChildFromDOM.apply(this, [
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER,
      Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID
    ]);
  }

  /**
   * Sets placeholders for each editable value on card (card number, expiration date, security code)
   */
  public setDefaultInputsValues() {
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
    this.setSecurityCodeOnProperSide();
  }

  /**
   * Sets card type based on binLookup request
   * @param cardNumber
   */
  public setCardType(cardNumber: string) {
    const type = this.binLookup.binLookup(cardNumber).type;
    return type ? type.toLowerCase() : type;
  }

  /**
   * Listens to changes coming from Card Number field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onCardNumberChanged(data: any) {
    const { formattedValue, value } = data;
    this.cardDetails.type = this.setCardType(value);
    this.cardDetails.cardNumber = AnimatedCard.setCardDetail(
      formattedValue,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER
    );
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.flipCardBack();
    this.resetTheme();
    this.setTheme();
    this.removeLogo();
    this.setLogo();
    this.setThemeClasses();
    this.setSecurityCodeOnProperSide();
  }

  /**
   * Listens to changes coming from Expiration Date field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onExpirationDateChanged(data: any) {
    const { value } = data;
    this.cardDetails.expirationDate = AnimatedCard.setCardDetail(
      value,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    );
    this.flipCardBack();
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
  }

  /**
   * Listens to changes coming from Security Code field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onSecurityCodeChanged(data: any) {
    const { value } = data;
    this.cardDetails.securityCode = AnimatedCard.setCardDetail(
      value,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
    );
    this.shouldFlipCard();
    this.setSecurityCodeOnProperSide();
  }

  /**
   * Sets subscribe events on every editable field of card
   */
  public setSubscribeEvents() {
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: any) => {
      this.onCardNumberChanged(data);
    });
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: any) =>
      this.onExpirationDateChanged(data)
    );
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: any) => this.onSecurityCodeChanged(data));
  }

  /**
   * Sets text label of particular element.
   * @param labelSelector
   * @param text
   * @private
   */
  private _setLabel(labelSelector: string, text: string) {
    document.getElementById(labelSelector).textContent = this._translator.translate(text);
  }
}

export default AnimatedCard;

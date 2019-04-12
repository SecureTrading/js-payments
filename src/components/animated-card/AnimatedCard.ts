import BinLookup from '../../core/shared/BinLookup';
import DOMMethods from '../../core/shared/DomMethods';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 */
class AnimatedCard {
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
    CLASS_SIDE: `${AnimatedCard.CARD_COMPONENT_CLASS}__side`,
    CLASS_LOGO_WRAPPER: `${AnimatedCard.CARD_COMPONENT_CLASS}-payment-logo`,
    CLASS_LOGO: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo`,
    CLASS_LOGO_DEFAULT: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo-default`,
    CLASS_LOGO_IMAGE: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo-img`
  };
  public static CARD_DETAILS_PLACEHOLDERS = {
    CARD_NUMBER: 'XXXX XXXX XXXX XXXX',
    EXPIRATION_DATE: 'MM/YY',
    SECURITY_CODE: 'XXX',
    TYPE: 'default'
  };

  public static NOT_FLIPPED_CARDS = ['amex'];

  // @ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Returns theme class for specified theme
   * @param theme
   */
  public returnThemeClass = (theme: string) => `${AnimatedCard.CARD_COMPONENT_CLASS}__${theme}`;

  public animatedCardBack: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_BACK);
  public animatedCardExpirationDate: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_ID);
  public animatedCardFront: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_FRONT);
  public animatedCardPan: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_ID);
  public animatedCardSecurityCode: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_ID);
  public animatedCardSecurityCodeFront: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_ID
  );
  public animatedCardLogoBackground: HTMLElement = document.getElementById(
    AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
  );
  public binLookup: BinLookup;
  public cardDetails: any = {
    cardNumber: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER,
    expirationDate: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE,
    securityCode: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE,
    type: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.TYPE
  };
  public cardElement: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  public messageBus: MessageBus;
  public themeObject: { type: string; logo: string };

  constructor() {
    this.binLookup = new BinLookup();
    this.messageBus = new MessageBus();
    this.setDefaultImagesAttributes();
    this.setDefaultInputsValues();
    this.setSubscribeEvents();
  }

  /**
   * Resets styles on both sides of credit card to default theme
   */
  public resetTheme() {
    this.animatedCardSecurityCodeFront.textContent = '';
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
    const { type } = this.themeObject;

    if (type === AnimatedCard.CARD_TYPES.DEFAULT) {
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    } else {
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO}`);
      DOMMethods.removeClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    }
    DOMMethods.addClass(this.animatedCardFront, this.returnThemeClass(type));
    DOMMethods.addClass(this.animatedCardBack, this.returnThemeClass(type));
  }

  /**
   * Sets card logo based on created themeObject
   */
  public setLogo() {
    const { logo, type } = this.themeObject;
    if (!document.getElementById(Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID) && logo) {
      const element = DOMMethods.setMultipleAttributes.apply(this, [
        {
          alt: type,
          src: logo,
          class: AnimatedCard.CARD_CLASSES.CLASS_LOGO_IMAGE,
          id: Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID
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
    switch (this.cardDetails.type) {
      case AnimatedCard.CARD_TYPES.AMEX:
        this.animatedCardSecurityCodeFront.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
        this.themeObject = { type: AnimatedCard.CARD_TYPES.AMEX, logo: cardsLogos.amex };
        break;
      case AnimatedCard.CARD_TYPES.ASTROPAYCARD:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.ASTROPAYCARD, logo: cardsLogos.astropaycard };
        break;
      case AnimatedCard.CARD_TYPES.DINERS:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.DINERS, logo: cardsLogos.diners };
        break;
      case AnimatedCard.CARD_TYPES.DISCOVER:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.DISCOVER, logo: cardsLogos.discover };
        break;
      case AnimatedCard.CARD_TYPES.JCB:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.JCB, logo: cardsLogos.jcb };
        break;
      case AnimatedCard.CARD_TYPES.MAESTRO:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.MAESTRO, logo: cardsLogos.maestro };
        break;
      case AnimatedCard.CARD_TYPES.MASTERCARD:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.MASTERCARD, logo: cardsLogos.mastercard };
        break;
      case AnimatedCard.CARD_TYPES.PIBA:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.PIBA, logo: cardsLogos.piba };
        break;
      case AnimatedCard.CARD_TYPES.VISA:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.VISA, logo: cardsLogos.visa };
        break;
      case AnimatedCard.CARD_TYPES.DEFAULT:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.DEFAULT, logo: '' };
        break;
      default:
        this.themeObject = { type: AnimatedCard.CARD_TYPES.DEFAULT, logo: '' };
    }
    return this.themeObject;
  }

  /**
   * For particular type of card it sets security code on front side of card
   */
  public setSecurityCodeOnProperSide = () =>
    this.cardDetails.type === AnimatedCard.CARD_TYPES.AMEX
      ? this.animatedCardSecurityCodeFront
      : this.animatedCardSecurityCode;

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
  public removeLogo = () =>
    DOMMethods.removeChildFromDOM.apply(this, [
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER,
      Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID
    ]);

  /**
   * Sets default attributes for card images - card logo and chip image
   */
  public setDefaultImagesAttributes() {
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.chip, Selectors.ANIMATED_CARD_CHIP_LOGO_ID]);
    DOMMethods.setProperty.apply(this, [
      'class',
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT,
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
    ]);
  }

  /**
   * Sets placeholders for each editable value on card (card number, expiration date, security code)
   */
  public setDefaultInputsValues() {
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Set one of three values on animated card
   * @param data
   * @param placeholder
   */
  public static setCardDetail(data: any, placeholder: string) {
    let { value } = data;
    return value ? value : placeholder;
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
    const { value } = data;
    this.cardDetails.type = this.setCardType(value);
    this.cardDetails.cardNumber = AnimatedCard.setCardDetail(data, AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER);
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.flipCardBack();
    this.resetTheme();
    this.setTheme();
    this.removeLogo();
    this.setLogo();
    this.setThemeClasses();
  }

  /**
   * Listens to changes coming from Expiration Date field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onExpirationDateChanged(data: any) {
    this.cardDetails.expirationDate = AnimatedCard.setCardDetail(
      data,
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
    this.cardDetails.securityCode = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
    );
    this.shouldFlipCard();
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Sets subscribe events on every editable field of card
   */
  public setSubscribeEvents() {
    this.messageBus.subscribe(MessageBus.EVENTS.CARD_NUMBER_CHANGE, (data: any) => this.onCardNumberChanged(data));
    this.messageBus.subscribe(MessageBus.EVENTS.EXPIRATION_DATE_CHANGE, (data: any) =>
      this.onExpirationDateChanged(data)
    );
    this.messageBus.subscribe(MessageBus.EVENTS.SECURITY_CODE_CHANGE, (data: any) => this.onSecurityCodeChanged(data));
  }
}

export default AnimatedCard;

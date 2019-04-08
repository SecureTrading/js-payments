import BinLookup from '../../core/shared/BinLookup';
import DOMMethods from '../../core/shared/DomMethods';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 */
class AnimatedCard {
  public static CARD_BRANDS = {
    AMEX: 'AMEX',
    ASTROPAYCARD: 'ASTROPAYCARD',
    DINERS: 'DINERS',
    DISCOVER: 'DISCOVER',
    JCB: 'JCB',
    MAESTRO: 'MAESTRO',
    MASTERCARD: 'MASTERCARD',
    PIBA: 'PIBA',
    VISA: 'VISA'
  };
  public static CARD_CLASSES = {
    CLASS_BACK: 'st-animated-card__back',
    CLASS_FOR_ANIMATION: 'st-animated-card__flip-card',
    CLASS_FRONT: 'st-animated-card__front',
    CLASS_MAIN: 'st-animated-card',
    CLASS_SIDE: 'st-animated-card__side'
  };
  public static CARD_DETAILS_PLACEHOLDERS = {
    CARD_NUMBER: 'XXXX XXXX XXXX XXXX',
    EXPIRATION_DATE: 'MM/YY',
    SECURITY_CODE: 'XXX',
    TYPE: 'VISA'
  };
  public static CHIP_LOGO_ID: string = 'st-chip-logo';

  public static COMPONENTS_IDS = {
    CARD_NUMBER: 'cardNumber',
    EXPIRATION_DATE: 'expirationDate',
    SECURITY_CODE: 'securityCode'
  };
  public static NOT_FLIPPED_CARDS = ['AMEX'];
  public static PAYMENT_LOGO_ID: string = 'st-payment-logo';

  // @ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Returns theme class for specified theme
   * @param theme
   */
  public static returnThemeClass = (theme: string) => `st-animated-card__${theme}`;

  public animatedCardBack: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_BACK);
  public animatedCardExpirationDate: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_ID);
  public animatedCardFront: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_FRONT);
  public animatedCardPan: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_ID);
  public animatedCardSecurityCode: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_ID);
  public animatedCardSecurityCodeFront: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_ID
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
  public resetToDefaultTheme() {
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
   * @param themeObject
   */
  public setThemeProperties(themeObject: { type: string; logo: string }) {
    const { logo, type } = themeObject;
    this.animatedCardFront.classList.add(type);
    this.animatedCardBack.classList.add(type);
    DOMMethods.setProperty.apply(this, ['src', logo, AnimatedCard.PAYMENT_LOGO_ID]);
  }

  public setThemeAttributes(type: string, logo: string) {
    const themeObject = { type: '', logo: '' };
    themeObject.type = AnimatedCard.returnThemeClass(type.toLowerCase());
    themeObject.logo = logo;
    if (type === AnimatedCard.CARD_BRANDS.AMEX) {
      this.animatedCardSecurityCodeFront.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
    }
    return themeObject;
  }

  /**
   * Sets card theme according to card brand coming from binLookup()
   */
  public setCardTheme() {
    let themeObject;
    this.resetToDefaultTheme();
    switch (this.cardDetails.type) {
      case AnimatedCard.CARD_BRANDS.AMEX:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.AMEX, cardsLogos.amex);
        break;
      case AnimatedCard.CARD_BRANDS.ASTROPAYCARD:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.ASTROPAYCARD, cardsLogos.astropaycard);
        break;
      case AnimatedCard.CARD_BRANDS.DINERS:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.DINERS, cardsLogos.diners);
        break;
      case AnimatedCard.CARD_BRANDS.DISCOVER:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.DISCOVER, cardsLogos.discover);
        break;
      case AnimatedCard.CARD_BRANDS.JCB:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.JCB, cardsLogos.jcb);
        break;
      case AnimatedCard.CARD_BRANDS.MAESTRO:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.MAESTRO, cardsLogos.maestro);
        break;
      case AnimatedCard.CARD_BRANDS.MASTERCARD:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.MASTERCARD, cardsLogos.mastercard);
        break;
      case AnimatedCard.CARD_BRANDS.PIBA:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.PIBA, cardsLogos.piba);
        break;
      case AnimatedCard.CARD_BRANDS.VISA:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.VISA, cardsLogos.visa);
        break;
      default:
        themeObject = this.setThemeAttributes(AnimatedCard.CARD_BRANDS.VISA, cardsLogos.visa);
    }
    this.setThemeProperties(themeObject);
    return themeObject;
  }

  /**
   * Sets value on animated card depends on field which has been currently edited
   * @param name
   */
  public setValueOnCard(name: string) {
    switch (name) {
      case AnimatedCard.COMPONENTS_IDS.CARD_NUMBER:
        this.animatedCardPan.textContent = this.cardDetails.cardNumber;
        break;
      case AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE:
        this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
        break;
      case AnimatedCard.COMPONENTS_IDS.SECURITY_CODE:
        this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
        break;
    }
  }

  public setSecurityCodeOnProperSide = () =>
    this.cardDetails.type === AnimatedCard.CARD_BRANDS.AMEX
      ? this.animatedCardSecurityCodeFront
      : this.animatedCardSecurityCode;

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard(type: string) {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(type)) {
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
  public flipCardBack(type: string) {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(type)) {
      if (this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.cardElement.setAttribute('class', Selectors.ANIMATED_CARD_INPUT_SELECTOR);
      }
    }
  }

  /**
   * Sets default attributes for card images - card logo and chip image
   */
  public setDefaultImagesAttributes() {
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.visa, AnimatedCard.PAYMENT_LOGO_ID]);
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.chip, AnimatedCard.CHIP_LOGO_ID]);
    DOMMethods.setProperty.apply(this, ['alt', this.cardDetails.type, AnimatedCard.PAYMENT_LOGO_ID]);
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
   * Listens to changes coming from each 'input-component' field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * name: Name of component from which came value
   * value: Value passed from component
   */
  public onCardNumberChanged(data: any) {
    this.cardDetails.type = this.binLookup.binLookup(data.value).type;
    DOMMethods.setProperty.apply(this, ['alt', this.cardDetails.type, AnimatedCard.PAYMENT_LOGO_ID]);
    this.cardDetails.cardNumber = AnimatedCard.setCardDetail(data, AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER);
    this.flipCardBack(this.cardDetails.type);
    this.setValueOnCard(AnimatedCard.COMPONENTS_IDS.CARD_NUMBER);
    this.setCardTheme();
  }

  /**
   * Listens to changes coming from each 'input-component' field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * name: Name of component from which came value
   * value: Value passed from component
   */
  public onExpirationDateChanged(data: any) {
    this.cardDetails.expirationDate = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    );
    this.flipCardBack(this.cardDetails.type);
    this.setValueOnCard(AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE);
  }

  /**
   * Listens to changes coming from each 'input-component' field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * name: Name of component from which came value
   * value: Value passed from component
   */
  public onSecurityCodeChanged(data: any) {
    this.cardDetails.securityCode = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
    );
    this.shouldFlipCard(this.cardDetails.type);
    this.setValueOnCard(AnimatedCard.COMPONENTS_IDS.SECURITY_CODE);
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

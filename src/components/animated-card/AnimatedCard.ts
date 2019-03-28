import DOMMethods from '../../core/shared/DomMethods';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 */
class AnimatedCard {
  public static ANIMATED_CARD_FIELDS_IDS = {
    CREDIT_CARD_ID: 'st-animated-card-number',
    EXPIRATION_DATE_ID: 'st-animated-card-expiration-date',
    SECURITY_CODE_ID: 'st-animated-card-security-code'
  };
  public static CARD_BRANDS = {
    AMEX: 'AMEX',
    ASTROPAYCARD: 'ASTROPAYCARD',
    DINERS: 'DINERS',
    DISCOVER: 'DISCOVER',
    JCB: 'JCB',
    LASER: 'LASER',
    MAESTRO: 'MAESTRO',
    MASTERCARD: 'MASTERCARD',
    PIBA: 'PIBA',
    VISA: 'VISA'
  };
  public static CHIP_LOGO_ID: string = 'st-chip-logo';
  public static CARD_CLASSES = {
    CLASS_MAIN: 'st-animated-card',
    CLASS_BACK: 'st-animated-card__back',
    CLASS_FOR_ANIMATION: 'st-animated-card__flip-card',
    CLASS_FRONT: 'st-animated-card__front',
    CLASS_SIDE: 'st-animated-card__side'
  };

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

  public animatedCardBack: HTMLElement = document.getElementById('st-animated-card-side-back');
  public animatedCardFront: HTMLElement = document.getElementById('st-animated-card-side-front');
  public cardDetails: any = {
    cardNumber: '.... .... .... ....',
    expirationDate: 'MM/YY',
    securityCode: '...',
    type: 'VISA'
  };
  public cardElement: HTMLElement;

  constructor() {
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.visa, AnimatedCard.PAYMENT_LOGO_ID]);
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.chip, AnimatedCard.CHIP_LOGO_ID]);
    this.cardElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    this.getCardData();
  }

  /**
   * Resets styles on both sides of credit card to default theme
   */
  public resetToDefaultTheme() {
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

  /**
   * Sets card theme according to card brand
   */
  public setCardTheme() {
    this.resetToDefaultTheme();
    let themeObject = { type: '', logo: '' };
    switch (this.cardDetails.type) {
      case AnimatedCard.CARD_BRANDS.AMEX:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.AMEX.toLowerCase());
        themeObject.logo = cardsLogos.amex;
        break;
      case AnimatedCard.CARD_BRANDS.ASTROPAYCARD:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.ASTROPAYCARD.toLowerCase());
        themeObject.logo = cardsLogos.astropaycard;
        break;
      case AnimatedCard.CARD_BRANDS.DINERS:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.DINERS.toLowerCase());
        themeObject.logo = cardsLogos.diners;
        break;
      case AnimatedCard.CARD_BRANDS.DISCOVER:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.DISCOVER.toLowerCase());
        themeObject.logo = cardsLogos.discover;
        break;
      case AnimatedCard.CARD_BRANDS.JCB:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.JCB.toLowerCase());
        themeObject.logo = cardsLogos.jcb;
        break;
      case AnimatedCard.CARD_BRANDS.LASER:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.LASER.toLowerCase());
        themeObject.logo = cardsLogos.laser;
        break;
      case AnimatedCard.CARD_BRANDS.MAESTRO:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.MAESTRO.toLowerCase());
        themeObject.logo = cardsLogos.maestro;
        break;
      case AnimatedCard.CARD_BRANDS.MASTERCARD:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.MASTERCARD.toLowerCase());
        themeObject.logo = cardsLogos.mastercard;
        break;
      case AnimatedCard.CARD_BRANDS.PIBA:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.PIBA.toLowerCase());
        themeObject.logo = cardsLogos.piba;
        break;
      case AnimatedCard.CARD_BRANDS.VISA:
        themeObject.type = AnimatedCard.returnThemeClass(AnimatedCard.CARD_BRANDS.VISA.toLowerCase());
        themeObject.logo = cardsLogos.visa;
        break;
      default:
        themeObject.type = AnimatedCard.CARD_CLASSES.CLASS_MAIN;
        themeObject.logo = cardsLogos.visa;
    }
    this.setThemeProperties(themeObject);
  }

  /**
   * Sets value on animated card depends on field which has been currently edited
   * @param name
   */
  public setValueOnCard(name: string) {
    let element;
    switch (name) {
      case AnimatedCard.COMPONENTS_IDS.CARD_NUMBER:
        element = document.getElementById(AnimatedCard.ANIMATED_CARD_FIELDS_IDS.CREDIT_CARD_ID);
        element.textContent = this.cardDetails.cardNumber;
        break;
      case AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE:
        element = document.getElementById(AnimatedCard.ANIMATED_CARD_FIELDS_IDS.EXPIRATION_DATE_ID);
        element.textContent = this.cardDetails.expirationDate;
        break;
      case AnimatedCard.COMPONENTS_IDS.SECURITY_CODE:
        element = document.getElementById(AnimatedCard.ANIMATED_CARD_FIELDS_IDS.SECURITY_CODE_ID);
        element.textContent = this.cardDetails.securityCode;
        break;
    }
  }

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
   * Listens to changes coming from each 'input-component' field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * name: Name of component from which came value
   * value: Value passed from component
   */
  public getCardData() {
    const messageBus = new MessageBus();
    const type = 'VISA';
    messageBus.subscribe(MessageBus.EVENTS.CARD_NUMBER_CHANGE, (data: any) => {
      this.flipCardBack(type);
      this.cardDetails.cardNumber = data.value;
      this.setCardTheme();
      this.setValueOnCard(AnimatedCard.COMPONENTS_IDS.CARD_NUMBER);
    });
    messageBus.subscribe(MessageBus.EVENTS.EXPIRATION_DATE_CHANGE, (data: any) => {
      this.flipCardBack(type);
      this.cardDetails.expirationDate = data.value;
      this.setCardTheme();
      this.setValueOnCard(AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE);
    });

    messageBus.subscribe(MessageBus.EVENTS.SECURITY_CODE_CHANGE, (data: any) => {
      this.shouldFlipCard(type);
      this.cardDetails.securityCode = data.value;
      this.setCardTheme();
      this.setValueOnCard(AnimatedCard.COMPONENTS_IDS.SECURITY_CODE);
    });
  }
}

export default AnimatedCard;

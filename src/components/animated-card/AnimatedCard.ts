import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';
import DOMMethods from '../../core/shared/DomMethods';

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
  public static CLASS_FOR_ANIMATION: string = 'st-animated-card__flip-card';
  public static COMPONENTS_IDS = {
    CARD_NUMBER: 'cardNumber',
    EXPIRATION_DATE: 'expirationDate',
    SECURITY_CODE: 'securityCode'
  };
  public static NOT_FLIPPED_CARDS = ['AMEX'];
  public static PAYMENT_LOGO_ID: string = 'st-payment-logo';
  public cardDetails: any = {
    type: 'VISA',
    cardNumber: '',
    expirationDate: '',
    securityCode: ''
  };

  public animatedCardBack: HTMLElement = document.getElementById('st-animated-card-side-back');
  public animatedCardFront: HTMLElement = document.getElementById('st-animated-card-side-front');
  public cardElement: HTMLElement;

  constructor() {
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.visa, AnimatedCard.PAYMENT_LOGO_ID]);
    DOMMethods.setProperty.apply(this, ['src', cardsLogos.chip, AnimatedCard.CHIP_LOGO_ID]);
    this.cardElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    this.valuesListener();
  }

  public backToDefaultTheme() {
    this.animatedCardFront.setAttribute('class', 'st-animated-card__side st-animated-card__front');
    this.animatedCardBack.setAttribute('class', 'st-animated-card__side st-animated-card__back');
  }

  public setThemeClasses(themeClass: string, cardLogo: string) {
    this.animatedCardFront.classList.add(themeClass);
    this.animatedCardBack.classList.add(themeClass);
    DOMMethods.setProperty.apply(this, ['src', cardLogo, AnimatedCard.PAYMENT_LOGO_ID]);
  }

  public static returnThemeClass(theme: string) {
    let baseClass = 'st-animated-card';
    return `${baseClass}__${theme}`;
  }

  /**
   * Sets card theme according to card brand
   */
  public setCardTheme() {
    this.backToDefaultTheme();
    let themeObject;
    switch (this.cardDetails.type) {
      case AnimatedCard.CARD_BRANDS.AMEX:
        themeObject = [AnimatedCard.returnThemeClass('amex'), cardsLogos.amex];
        break;
      case AnimatedCard.CARD_BRANDS.ASTROPAYCARD:
        themeObject = [AnimatedCard.returnThemeClass('astropaycard'), cardsLogos.astropaycard];
        break;
      case AnimatedCard.CARD_BRANDS.DINERS:
        themeObject = [AnimatedCard.returnThemeClass('diners'), cardsLogos.diners];
        break;
      case AnimatedCard.CARD_BRANDS.DISCOVER:
        themeObject = [AnimatedCard.returnThemeClass('discover'), cardsLogos.discover];
        break;
      case AnimatedCard.CARD_BRANDS.LASER:
        themeObject = [AnimatedCard.returnThemeClass('laser'), cardsLogos.laser];
        break;
      case AnimatedCard.CARD_BRANDS.MAESTRO:
        themeObject = [AnimatedCard.returnThemeClass('maestro'), cardsLogos.maestro];
        break;
      case AnimatedCard.CARD_BRANDS.MASTERCARD:
        themeObject = [AnimatedCard.returnThemeClass('mastercard'), cardsLogos.mastercard];
        break;
      case AnimatedCard.CARD_BRANDS.PIBA:
        themeObject = [AnimatedCard.returnThemeClass('piba'), cardsLogos.piba];
        break;
      case AnimatedCard.CARD_BRANDS.VISA:
        themeObject = [AnimatedCard.returnThemeClass('visa'), cardsLogos.visa];
        break;
      default:
        themeObject = ['st-animated-card', cardsLogos.visa];
    }
    this.setThemeClasses(themeObject[0], themeObject[1]);
  }

  /**
   * Sets value on animated card depends on field which has been currently edited
   * @param name
   */
  public setValueOnCard(name: string) {
    let element;
    if (name === AnimatedCard.COMPONENTS_IDS.CARD_NUMBER) {
      element = document.getElementById(AnimatedCard.ANIMATED_CARD_FIELDS_IDS.CREDIT_CARD_ID);
      element.textContent = this.cardDetails.cardNumber;
    } else if (name === AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE) {
      element = document.getElementById(AnimatedCard.ANIMATED_CARD_FIELDS_IDS.EXPIRATION_DATE_ID);
      element.textContent = this.cardDetails.expirationDate;
    } else if (name === AnimatedCard.COMPONENTS_IDS.SECURITY_CODE) {
      element = document.getElementById(AnimatedCard.ANIMATED_CARD_FIELDS_IDS.SECURITY_CODE_ID);
      element.textContent = this.cardDetails.securityCode;
    }
  }

  //@ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard(type: string) {
    if (AnimatedCard.NOT_FLIPPED_CARDS.includes(type)) {
      this.flipCard();
    } else {
      this.flipCardBack();
    }
  }

  /**
   * Flips card to see details on revers
   */
  public flipCard = () => this.cardElement.classList.add(AnimatedCard.CLASS_FOR_ANIMATION);

  /**
   * Flips back card by clearing classes
   */
  public flipCardBack() {
    this.cardElement.setAttribute('class', Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  }

  /**
   * Listens to changes coming from each 'input-component' field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * name: Name of component from which came value
   * value: Value passed from component
   */
  public valuesListener() {
    window.addEventListener('message', event => {
      const { name, value, type } = event.data;
      if (name === AnimatedCard.COMPONENTS_IDS.CARD_NUMBER) {
        this.cardDetails.cardNumber = value;
        this.setCardTheme();
      } else if (name === AnimatedCard.COMPONENTS_IDS.SECURITY_CODE) {
        this.shouldFlipCard(type);
        this.cardDetails.securityCode = value;
        this.setCardTheme();
      } else if (name === AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE) {
        this.cardDetails.expirationDate = value;
        this.setCardTheme();
      }
      this.setValueOnCard(name);
    });
  }
}

export default AnimatedCard;

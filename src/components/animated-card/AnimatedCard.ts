import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 *
 */
class AnimatedCard {
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
  public static COMPONENTS_IDS = {
    CARD_NUMBER: 'cardNumber',
    EXPIRATION_DATE: 'expirationDate',
    SECURITY_CODE: 'securityCode'
  };
  public static ANIMATED_CARD_FIELDS_IDS = {
    CREDIT_CARD_ID: 'st-animated-card-number',
    EXPIRATION_DATE_ID: 'st-animated-card-expiration-date',
    SECURITY_CODE_ID: 'st-animated-card-security-code'
  };
  public cardDetails: any = {
    type: 'MASTERCARD',
    cardNumber: '4444444444444444',
    expirationDate: '12/24',
    securityCode: '444'
  };
  public cardElement: HTMLElement;
  public notFlippedCards = ['AMEX'];
  public animatedCardFront = document.getElementById('st-animated-card-side-front');
  public animatedCardBack = document.getElementById('st-animated-card-side-back');

  constructor() {
    this.setProperty('src', cardsLogos.visa, 'st-payment-logo');
    this.setProperty('src', cardsLogos.chip, 'st-chip-logo');
    this.cardElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    this.getCardData();
  }

  public setProperty(attr: string, value: string, elementId: string) {
    const element = document.getElementById(elementId);
    element.setAttribute(attr, value);
    return element;
  }

  /**
   * Sets card theme according to card brand
   */
  public setCardTheme() {
    this.animatedCardFront.setAttribute('class', 'st-animated-card__side st-animated-card__front');
    this.animatedCardBack.setAttribute('class', 'st-animated-card__side st-animated-card__back');
    if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.AMEX) {
      this.animatedCardFront.classList.add('st-animated-card__amex');
      this.animatedCardBack.classList.add('st-animated-card__amex');
      this.setProperty('src', cardsLogos.amex, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.ASTROPAYCARD) {
      this.animatedCardFront.classList.add('st-animated-card__astropaycard');
      this.animatedCardBack.classList.add('st-animated-card__astropaycard');
      this.setProperty('src', cardsLogos.astropaycard, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.DINERS) {
      this.animatedCardFront.classList.add('st-animated-card__diners');
      this.animatedCardBack.classList.add('st-animated-card__diners');
      this.setProperty('src', cardsLogos.diners, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.DISCOVER) {
      this.animatedCardFront.classList.add('st-animated-card__discover');
      this.animatedCardBack.classList.add('st-animated-card__discover');
      this.setProperty('src', cardsLogos.discover, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.JCB) {
      this.animatedCardFront.classList.add('st-animated-card__jcb');
      this.animatedCardBack.classList.add('st-animated-card__jcb');
      this.setProperty('src', cardsLogos.jcb, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.LASER) {
      this.animatedCardFront.classList.add('st-animated-card__laser');
      this.animatedCardBack.classList.add('st-animated-card__laser');
      this.setProperty('src', cardsLogos.laser, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.MAESTRO) {
      this.animatedCardFront.classList.add('st-animated-card__maestro');
      this.animatedCardBack.classList.add('st-animated-card__maestro');
      this.setProperty('src', cardsLogos.maestro, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.MASTERCARD) {
      this.animatedCardFront.classList.add('st-animated-card__mastercard');
      this.animatedCardBack.classList.add('st-animated-card__mastercard');
      this.setProperty('src', cardsLogos.mastercard, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.PIBA) {
      this.animatedCardFront.classList.add('st-animated-card__piba');
      this.animatedCardBack.classList.add('st-animated-card__piba');
      this.cardElement.classList.add('st-animated-card__piba');
      this.setProperty('src', cardsLogos.piba, 'st-payment-logo');
    } else if (this.cardDetails.type === AnimatedCard.CARD_BRANDS.VISA) {
      this.animatedCardFront.classList.add('st-animated-card__visa');
      this.animatedCardBack.classList.add('st-animated-card__visa');
      this.setProperty('src', cardsLogos.visa, 'st-payment-logo');
    }
  }

  /**
   * Receives data sent from one of the fields
   */
  public getCardData() {
    window.addEventListener('message', ({ data }) => {
      const { name, value, type } = data;
      this.cardDetails.type = type;
      if (name === AnimatedCard.COMPONENTS_IDS.CARD_NUMBER) {
        this.cardDetails.cardNumber = value;
        this.setValueOnCard();
        this.setCardTheme();
      } else if (name === AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE) {
        this.cardDetails.expirationDate = value;
        this.setValueOnCard();
        this.setCardTheme();
      } else if (name === AnimatedCard.COMPONENTS_IDS.SECURITY_CODE) {
        this.cardDetails.securityCode = value;
        this.setValueOnCard();
        this.setCardTheme();
      }
      return { name, value };
    });
  }

  /**
   *
   */
  public setValueOnCard() {
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
  static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard = () => this.notFlippedCards.includes(this.cardDetails.type);

  public flipCard() {
    console.log(this.cardElement.classList);
    this.cardElement.classList.add('st-animated-card__flip-card');
  }

  public createCard() {}
}

export default AnimatedCard;

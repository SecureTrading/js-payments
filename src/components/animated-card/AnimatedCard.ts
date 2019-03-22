import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 *
 */
class AnimatedCard {
  public cardDetails: any = {
    type: 'MASTERCARD',
    pan: '4444444444444444',
    expirationDate: '12/24',
    securityCode: '444'
  };
  public cardElement: HTMLElement;
  public notFlippedCards = ['AMEX'];

  constructor() {
    this.setProperty('src', cardsLogos.amex, 'st-payment-logo');
    this.setProperty('src', cardsLogos.chip, 'st-chip-logo');
    this.cardElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  }

  public setProperty(attr: string, value: string, elementId: string) {
    const element = document.getElementById(elementId);
    element.setAttribute(attr, value);
    return element;
  }

  static ifCardExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  }

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard = () => this.notFlippedCards.includes(this.cardDetails.type);

  public flipCard() {
    const card = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    card.classList.add('st-animated-card__flip-card');
  }

  public createCard() {}
}

export default AnimatedCard;

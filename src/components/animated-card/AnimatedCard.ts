import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 *
 */
class AnimatedCard {
  private _pan: string = '4444444444444444';
  private _expirationDate: string = '12/24';
  private _securityCode: string = '444';

  constructor() {
    console.log(`${this._pan} ${this._expirationDate} ${this._securityCode}`);
    this.setImage('st-payment-logo', cardsLogos.amex);
  }

  static ifCardExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  }

  public setImage(id: string, base: string) {
    const image = document.getElementById(id);
    image.setAttribute('src', base);
    console.log(image);
    return image;
  }
}

export default AnimatedCard;

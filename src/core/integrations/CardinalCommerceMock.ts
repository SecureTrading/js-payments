import { environment } from '../../environments/environment';
import { CardinalCommerce } from './CardinalCommerce';

export default class CardinalCommerceMock extends CardinalCommerce {
  constructor(step: boolean) {
    super(step);
  }

  // TODO override _onCardinalLoad to do nothing
  // TODO override _performBinDetection to do nothing
  // TODO override /jwt/ in test code to return AUTH response

  protected _authenticateCard() {
    fetch(environment.CARDINAL_COMMERCE.MOCK.AUTHENTICATE_CARD_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        this._onCardinalValidated(data.data, data.jwt);
      });
  }
}

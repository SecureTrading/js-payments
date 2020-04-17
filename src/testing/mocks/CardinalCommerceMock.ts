import { environment } from '../../environments/environment';
import { CardinalCommerce } from '../../application/core/integrations/CardinalCommerce';
import { Service } from 'typedi';

@Service()
export class CardinalCommerceMock extends CardinalCommerce {
  protected _performBinDetection(data: string) {
    return true;
  }

  protected _onCardinalLoad() {
    this._onCardinalSetupComplete();
  }

  protected setupCardinalCommerceLibrary() {
    this._onCardinalLoad();
  }

  protected _authenticateCard() {
    return fetch(environment.CARDINAL_COMMERCE.MOCK.AUTHENTICATE_CARD_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        this._onCardinalValidated(data.data, data.jwt);
      });
  }
}

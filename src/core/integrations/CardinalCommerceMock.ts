import { environment } from '../../environments/environment';
import { IFormFieldState } from '../models/FormFieldState';
import { CardinalCommerce } from './CardinalCommerce';

export default class CardinalCommerceMock extends CardinalCommerce {
  protected _performBinDetection(data: IFormFieldState) {
    return true;
  }

  protected _onCardinalLoad() {
    this._onCardinalSetupComplete();
  }

  protected _threeDSetup() {
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

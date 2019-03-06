/***
 * Establishes connection with ST, defines client.
 */
import VisaCheckout from './VisaCheckout.class';

class ST extends VisaCheckout {
  private _jwt: string;
  private _style: object;
  public payments: object[];

  constructor(jwt: string, style: object, payments: object[]) {
    super();
    this._jwt = jwt;
    this._style = style;
    this.payments = payments;
  }
}

export default ST;

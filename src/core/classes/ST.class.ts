/***
 * Establishes connection with ST, defines client.
 */
import VisaCheckout from './VisaCheckout.class';

class ST {
  public jwt: string;
  public style: object;
  public payments: object[];

  constructor(jwt: string, style: object, payments: object[]) {
    this.jwt = jwt;
    this.style = style;
    this.payments = payments;
    const visa = new VisaCheckout(this._getPayments());
  }

  private _getPayments() {
    return Object.values(this.payments).find(
      // @ts-ignore
      item => item.name === 'VISA'
    );
  }
}

export default ST;

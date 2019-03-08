/***
 * Establishes connection with ST, defines client.
 */
import ApplePay from './ApplePay.class';

class ST {
  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  constructor(id: string) {
    this._id = id;
    new ApplePay('merchant.net.securetrading.test');
  }
}

export default ST;

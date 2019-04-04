import * as JwtDecode from 'jwt-decode';
import { Money, Currencies } from 'ts-money';

export interface StJwtPayload {
  [key: string]: string;
}

export interface StJwtObj {
  payload: StJwtPayload;
}

/***
 * Decodes a ST Jwt passed in by a merchant
 * Does not verify it as this will be done by the server
 */
export class StJwt {
  private _decodedJwt: StJwtObj;
  public payload: StJwtPayload;

  constructor(jwt: string) {
    this._decodedJwt = JwtDecode<StJwtObj>(jwt);
    this.payload = this._decodedJwt.payload;
  }

  /**
   * Convenience getter for returning the sitereference
   * @return The sitereference contained inside the encoded payload
   */
  public get sitereference() {
    return this.payload.sitereference;
  }

  /**
   * Convenience getter for returning the 3-digit currency code according to the ISO standard
   * @return The currencyiso3a contained inside the encoded payload
   */
  public get currencyiso3a() {
    return this.payload.currencyiso3a;
  }

  private get currency() {
    // Currencies doesn't define index signature so treating as 'any'
    return (Currencies as any)[this.payload.currencyiso3a];
  }

    /**
    * Convenience getter for returning the locale
    * @return The locale contained inside the encoded payload or en_GB if undefined
    */
    public get locale() {
        return this.payload.locale || 'en_GB';
    }

   /**
   * Convenience getter for returning the amount in main units and converting from base units
   * @return The mainamount calculated using the encoded payload
   */
  public get mainamount() {
    let mainamount = this.payload.mainamount;
    if (mainamount === undefined) {
      // Merchants can specify amount in main or base units so need to convert to main
      mainamount = Money.fromInteger({ amount: parseInt(this.payload.baseamount), currency: this.currency }).toString();
    }
    return mainamount;
  }
}

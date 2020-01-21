import JwtDecode from 'jwt-decode';
import { Currencies, Money } from 'ts-money';
import { IStJwtObj } from '../models/IStJwtObj';
import { IStJwtPayload } from '../models/IStJwtPayload';

export class StJwt {
  private static DEFAULT_LOCALE: string = 'en_GB';
  public payload: IStJwtPayload;
  private _decodedJwt: IStJwtObj;

  constructor(jwt: string) {
    this._decodedJwt = JwtDecode<IStJwtObj>(jwt);
    this.payload = this._decodedJwt.payload;
  }

  public get sitereference(): string {
    return this.payload.sitereference;
  }

  public get currencyiso3a(): string {
    return this.payload.currencyiso3a;
  }

  private get currency(): string {
    return (Currencies as Currencies)[this.payload.currencyiso3a];
  }

  public get locale(): string {
    return this.payload.locale || StJwt.DEFAULT_LOCALE;
  }

  public get mainamount(): string {
    let mainamount = this.payload.mainamount;
    if (mainamount === undefined) {
      mainamount = Money.fromInteger({
        amount: parseInt(this.payload.baseamount, 10),
        currency: this.currency
      }).toString();
    }
    return mainamount;
  }
}

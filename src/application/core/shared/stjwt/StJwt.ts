import JwtDecode from 'jwt-decode';
import { Currencies, Money } from 'ts-money';
import { IStJwtObj } from '../../models/IStJwtObj';
import { IStJwtPayload } from '../../models/IStJwtPayload';

export class StJwt {
  public payload: IStJwtPayload;
  private _decodedJwt: IStJwtObj;

  constructor(jwt: string) {
    this._decodedJwt = JwtDecode<IStJwtObj>(jwt);
    this.payload = this._decodedJwt.payload;
  }

  public get sitereference() {
    return this.payload.sitereference;
  }

  public get currencyiso3a() {
    return this.payload.currencyiso3a;
  }

  private get currency() {
    return (Currencies as any)[this.payload.currencyiso3a];
  }

  public get locale() {
    return this.payload.locale || 'en_GB';
  }

  public get mainamount() {
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

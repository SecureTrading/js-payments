import { IStRequest } from '../classes/StCodec.class';
import { StJwt, StJwtPayload } from './StJwt';
import StTransport from '../classes/StTransport.class';

export default class Payment {
  private _stTransport: StTransport;
  private _stJwtDecode: any;
  private readonly _stJwtPayload: StJwtPayload;
  private _cardinalCommerceCacheToken: string;

  constructor(jwt: string) {
    this._stTransport = new StTransport({ jwt: jwt });
    this._stJwtDecode = new StJwt(jwt);
    this._stJwtPayload = this._stJwtDecode.payload;
  }

  public tokenizeCard(payment: Card | Wallet): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'CACHETOKENISE'
      },
      payment,
      this._stJwtPayload
    );

    return this._stTransport.sendRequest(requestBody);
  }

  public walletVerify(wallet: WalletVerify) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'WALLETVERIFY'
      },
      wallet,
      this._stJwtPayload
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public authorizePayment(payment: Card | Wallet, threeDResponse?: string) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'AUTH'
      },
      threeDResponse ? { threedresponse: threeDResponse } : {},
      this._stJwtPayload,
      payment
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public threeDInitRequest() {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'THREEDINIT'
      },
      this._stJwtPayload
    );

    return this._stTransport.sendRequest(requestBody).then(responseBody => {
      // @ts-ignore
      this._cardinalCommerceCacheToken = responseBody.cachetoken;
      return responseBody;
    });
  }

  public threeDQueryRequest(card: Card): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'THREEDQUERY',
        termurl: 'https://termurl.com',
        cachetoken: this._cardinalCommerceCacheToken
      },
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }
}

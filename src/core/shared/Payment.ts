import { IStRequest } from '../classes/StCodec.class';
import StTransport from '../classes/StTransport.class';
import { IStJwtPayload, StJwt } from './StJwt';

export default class Payment {
  private _stTransport: StTransport;
  private _stJwtDecode: any;
  private readonly _stJwtPayload: IStJwtPayload;
  private _cardinalCommerceCacheToken: string;

  constructor(jwt: string) {
    this._stTransport = new StTransport({ jwt });
    this._stJwtDecode = new StJwt(jwt);
    this._stJwtPayload = this._stJwtDecode.payload;
  }

  public tokenizeCard(card: ICard): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'CACHETOKENISE'
      },
      this._stJwtPayload,
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }

  public walletVerify(wallet: IWalletVerify) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'WALLETVERIFY'
      },
      wallet,
      this._stJwtPayload
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public authorizePayment(payment: ICard | IWallet, additionalData?: any) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'AUTH'
      },
      additionalData,
      this._stJwtPayload,
      payment
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public threeDInitRequest() {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'JSINIT'
      },
      this._stJwtPayload
    );

    return this._stTransport.sendRequest(requestBody).then(responseBody => {
      // @ts-ignore
      this._cardinalCommerceCacheToken = responseBody.cachetoken;
      return responseBody;
    });
  }

  public threeDQueryRequest(card: ICard): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        cachetoken: this._cardinalCommerceCacheToken,
        requesttypedescription: 'THREEDQUERY',
        termurl: 'https://termurl.com'
      },
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }
}

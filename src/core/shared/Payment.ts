import { IStRequest } from '../classes/StCodec.class';
import StTransport from '../classes/StTransport.class';
import { IMerchantData } from '../models/MerchantData';
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
      this._stJwtPayload, // TODO we shouldn't need to include the stjwtpayload here on any request we send the full jwt in so the server will decode and update with data inside jwt
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

  public authorizePayment(payment: ICard | IWallet, merchantData: IMerchantData, additionalData?: any) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'AUTH'
      },
      additionalData,
      this._stJwtPayload,
      merchantData,
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

  public threeDQueryRequest(card: ICard, merchantData: IMerchantData): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        cachetoken: this._cardinalCommerceCacheToken,
        requesttypedescription: 'THREEDQUERY',
        termurl: 'https://termurl.com' // TODO shouldn't this be removed?
      },
      merchantData,
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }
}

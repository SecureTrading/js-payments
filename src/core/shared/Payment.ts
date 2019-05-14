import { IStRequest } from '../classes/StCodec.class';
import StTransport from '../classes/StTransport.class';
import { IMerchantData } from '../models/MerchantData';
import { IStJwtPayload, StJwt } from './StJwt';

export default class Payment {
  private _stTransport: StTransport;
  private _cardinalCommerceCacheToken: string;

  constructor(jwt: string) {
    this._stTransport = new StTransport({ jwt });
  }

  public tokenizeCard(card: ICard): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'CACHETOKENISE'
      },
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }

  public walletVerify(wallet: IWalletVerify) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'WALLETVERIFY'
      },
      wallet
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public authorizePayment(payment: ICard | IWallet, merchantData: IMerchantData, additionalData?: any) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'AUTH'
      },
      additionalData,
      merchantData,
      payment
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public threeDInitRequest() {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'JSINIT'
      }
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
        termurl: 'https://termurl.com' // TODO this shouldn't be needed but currently the backend needs this
      },
      merchantData,
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }
}

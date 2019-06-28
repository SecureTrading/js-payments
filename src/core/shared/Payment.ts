import { IStRequest } from '../classes/StCodec.class';
import StTransport from '../classes/StTransport.class';
import { IMerchantData } from '../models/MerchantData';

export default class Payment {
  private _stTransport: StTransport;
  private _cardinalCommerceCacheToken: string;

  constructor(jwt: string, gatewayUrl: string, parentOrigin?: string) {
    this._stTransport = new StTransport({ jwt, gatewayUrl }, parentOrigin);
  }

  public walletVerify(wallet: IWalletVerify) {
    const requestBody: IStRequest = Object.assign(
      {
        requesttypedescriptions: ['WALLETVERIFY']
      },
      wallet
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public processPayment(
    requestTypes: string[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    additionalData?: any
  ): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      { requesttypedescriptions: requestTypes },
      additionalData,
      merchantData,
      payment
    );
    return this._stTransport.sendRequest(requestBody);
  }

  public threeDInitRequest() {
    const requestBody: IStRequest = {
      requesttypedescriptions: ['JSINIT']
    };
    return this._stTransport.sendRequest(requestBody).then((result: any) => {
      this._cardinalCommerceCacheToken = result.response.cachetoken;
      console.log(result);
      return result;
    });
  }

  public byPassInitRequest(cachetoken: string) {
    this._cardinalCommerceCacheToken = cachetoken;
  }

  public threeDQueryRequest(requestTypes: string[], card: ICard, merchantData: IMerchantData): Promise<object> {
    const requestBody: IStRequest = Object.assign(
      {
        cachetoken: this._cardinalCommerceCacheToken,
        requesttypedescriptions: requestTypes,
        termurl: 'https://termurl.com' // TODO this shouldn't be needed but currently the backend needs this
      },
      merchantData,
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }
}

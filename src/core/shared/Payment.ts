import { IStRequest } from '../models/IStRequest';
import { StTransport } from '../classes/StTransport.class';
import { ICard } from '../models/ICard';
import { IMerchantData } from '../models/IMerchantData';
import { IWallet } from '../models/IWallet';
import { IWalletVerify } from '../models/IWalletVerify';
import { StJwt } from './StJwt';
import { Validation } from './Validation';
import { Container } from 'typedi';
import { NotificationService } from '../services/notification/NotificationService';

export class Payment {
  private _cardinalCommerceCacheToken: string;
  private _notification: NotificationService;
  private _processPaymentRequestBody: IStRequest;
  private _stTransport: StTransport;
  private _threeDInitRequestBody: IStRequest;
  private _threeDQueryRequestBody: IStRequest;
  private _validation: Validation;
  private readonly _walletVerifyRequest: IStRequest;

  constructor(jwt: string, gatewayUrl: string) {
    this._notification = Container.get(NotificationService);
    this._stTransport = new StTransport({ jwt, gatewayUrl });
    this._validation = new Validation();
    this._walletVerifyRequest = {
      requesttypedescriptions: ['WALLETVERIFY']
    };
    this._threeDInitRequestBody = {
      requesttypedescriptions: ['JSINIT']
    };
  }

  public bypassInitRequest(cachetoken: string) {
    this._cardinalCommerceCacheToken = cachetoken;
  }

  public async processPayment(
    requestTypes: string[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    additionalData?: any
  ): Promise<object> {
    this._processPaymentRequestBody = Object.assign(
      { requesttypedescriptions: requestTypes },
      additionalData,
      merchantData,
      payment
    );
    return await this._stTransport.sendRequest(this._processPaymentRequestBody).then(({ response }: any) => response);
  }

  public threeDInitRequest() {
    return this._stTransport.sendRequest(this._threeDInitRequestBody).then((result: { jwt: string; response: any }) => {
      const {
        payload: { jwt, response }
      } = new StJwt(result.jwt);
      const threeDInitResult = { jwt, response: response[0] };
      this._cardinalCommerceCacheToken = result.response.cachetoken;
      return threeDInitResult;
    });
  }

  public threeDQueryRequest(requestTypes: string[], card: ICard, merchantData: IMerchantData): Promise<object> {
    this._threeDQueryRequestBody = Object.assign(
      {
        cachetoken: this._cardinalCommerceCacheToken,
        requesttypedescriptions: requestTypes,
        termurl: 'https://termurl.com' // TODO this shouldn't be needed but currently the backend needs this
      },
      merchantData,
      card
    );
    return this._stTransport.sendRequest(this._threeDQueryRequestBody);
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}

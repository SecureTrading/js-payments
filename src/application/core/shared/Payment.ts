import { IStRequest } from '../models/IStRequest';
import { StTransport } from '../services/StTransport.class';
import { ICard } from '../models/ICard';
import { IMerchantData } from '../models/IMerchantData';
import { IWallet } from '../models/IWallet';
import { IWalletVerify } from '../models/IWalletVerify';
import { StJwt } from './StJwt';
import { Validation } from './Validation';
import { Container } from 'typedi';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Cybertonica } from '../integrations/Cybertonica';

export class Payment {
  private _cardinalCommerceCacheToken: string;
  private _notification: NotificationService;
  private _stTransport: StTransport;
  private _threeDInitRequestBody: IStRequest;
  private _validation: Validation;
  private _cybertonica: Cybertonica;
  private readonly _walletVerifyRequest: IStRequest;

  constructor(jwt: string, gatewayUrl: string, parentOrigin?: string) {
    this._notification = Container.get(NotificationService);
    this._cybertonica = Container.get(Cybertonica);
    this._stTransport = new StTransport({ jwt, gatewayUrl }, parentOrigin);
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
    const processPaymentRequestBody = {
      additionalData,
      merchantData,
      payment,
      requesttypedescriptions: requestTypes,
      fraudcontroltransactionid: await this._cybertonica.getTransactionId()
    };

    return this._stTransport.sendRequest(processPaymentRequestBody);
  }

  public threeDInitRequest() {
    return this._stTransport.sendRequest(this._threeDInitRequestBody).then((result: { jwt: string; response: any }) => {
      const {
        payload: { jwt, response }
      } = new StJwt(result.jwt);
      const threeDInitResult = { jwt, response: response[0] };
      // We should always use the id from the original cachetoken to link up with the THREEDQUERY
      // We've already passed this into Cardinal and they have used it for the fingerprint by this point
      if (this._cardinalCommerceCacheToken === undefined) {
        // @ts-ignore
        this._cardinalCommerceCacheToken = result.response.cachetoken;
      }
      return threeDInitResult;
    });
  }

  public async threeDQueryRequest(requestTypes: string[], card: ICard, merchantData: IMerchantData): Promise<object> {
    const threeDQueryRequestBody = {
      merchantData,
      card,
      cachetoken: this._cardinalCommerceCacheToken,
      requesttypedescriptions: requestTypes,
      termurl: 'https://termurl.com', // TODO this shouldn't be needed but currently the backend needs this
      fraudcontroltransactionid: await this._cybertonica.getTransactionId()
    };

    return this._stTransport.sendRequest(threeDQueryRequestBody);
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}

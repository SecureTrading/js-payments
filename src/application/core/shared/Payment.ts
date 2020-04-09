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

  constructor(jwt: string, gatewayUrl: string) {
    this._notification = Container.get(NotificationService);
    this._cybertonica = Container.get(Cybertonica);
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
    const processPaymentRequestBody = {
      requesttypedescriptions: requestTypes,
      ...additionalData,
      ...merchantData,
      ...payment
    };
    const cybertonicaTid = await this._cybertonica.getTransactionId();

    if (cybertonicaTid) {
      (processPaymentRequestBody as any).fraudcontroltransactionid = cybertonicaTid;
    }

    return this._stTransport.sendRequest(processPaymentRequestBody).catch(e => {
      console.error('process payment catch');
      console.error(JSON.stringify(e));
    });
  }

  public threeDInitRequest() {
    return this._stTransport
      .sendRequest(this._threeDInitRequestBody)
      .then((result: { jwt: string; response: any }) => {
        const {
          payload: { jwt, response }
        } = new StJwt(result.jwt);
        const threeDInitResult = { jwt, response: response[0] };
        this._cardinalCommerceCacheToken = result.response.cachetoken;
        return threeDInitResult;
      })
      .catch(e => {
        console.error('3d init catch');
        console.error(JSON.stringify(e));
      });
  }

  public async threeDQueryRequest(requestTypes: string[], card: ICard, merchantData: IMerchantData): Promise<object> {
    const threeDQueryRequestBody = {
      cachetoken: this._cardinalCommerceCacheToken,
      requesttypedescriptions: requestTypes,
      termurl: 'https://termurl.com', // TODO this shouldn't be needed but currently the backend needs this
      ...merchantData,
      ...card
    };

    const cybertonicaTid = await this._cybertonica.getTransactionId();

    if (cybertonicaTid) {
      (threeDQueryRequestBody as any).fraudcontroltransactionid = cybertonicaTid;
    }

    return this._stTransport.sendRequest(threeDQueryRequestBody).catch(e => {
      console.error('3d query catch');
      console.error(JSON.stringify(e));
    });
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}

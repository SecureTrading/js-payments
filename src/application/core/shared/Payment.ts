import { IStRequest } from '../models/IStRequest';
import { StTransport } from '../services/StTransport.class';
import { IMerchantData } from '../models/IMerchantData';
import { IWallet } from '../models/IWallet';
import { IWalletVerify } from '../models/IWalletVerify';
import { Validation } from './Validation';
import { Container } from 'typedi';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Cybertonica } from '../integrations/Cybertonica';
import { ICard } from '../models/ICard';

export class Payment {
  private _cardinalCommerceCacheToken: string;
  private _notification: NotificationService;
  private _stTransport: StTransport;
  private _validation: Validation;
  private _cybertonica: Cybertonica;
  private readonly _walletVerifyRequest: IStRequest;

  constructor() {
    this._notification = Container.get(NotificationService);
    this._cybertonica = Container.get(Cybertonica);
    this._stTransport = Container.get(StTransport);
    this._validation = new Validation();
    this._walletVerifyRequest = {
      requesttypedescriptions: ['WALLETVERIFY']
    };
  }

  public setCardinalCommerceCacheToken(cachetoken: string) {
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

    return this._stTransport.sendRequest(processPaymentRequestBody);
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}

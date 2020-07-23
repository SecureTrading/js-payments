import { IStRequest } from '../models/IStRequest';
import { StCodec } from '../services/StCodec.class';
import { StTransport } from '../services/StTransport.class';
import { ICard } from '../models/ICard';
import { IMerchantData } from '../models/IMerchantData';
import { IWallet } from '../models/IWallet';
import { IWalletVerify } from '../models/IWalletVerify';
import { Language } from './Language';
import { Validation } from './Validation';
import { Container } from 'typedi';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Cybertonica } from '../integrations/Cybertonica';
import { MessageBus } from './MessageBus';
import { Frame } from './frame/Frame';

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
    if (requestTypes.length === 0) {
      // This should only happen if were processing a 3DS payment with no requests after the THREEDQUERY
      StCodec.publishResponse(
        this._stTransport._threeDQueryResult.response,
        this._stTransport._threeDQueryResult.jwt,
        additionalData.threedresponse
      );
      this._notification.success(Language.translations.PAYMENT_SUCCESS);
      return Promise.resolve({
        response: {}
      });
    }

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

  // TODO is this even used anymore?
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

    return this._stTransport.sendRequest(threeDQueryRequestBody);
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}

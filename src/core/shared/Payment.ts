import { IStRequest } from '../classes/StCodec.class';
import StTransport from '../classes/StTransport.class';
import { IMerchantData } from '../models/MerchantData';
import Language from './Language';
import Notification from './Notification';
import Validation from './Validation';

/**
 * Gathers all payment processes and flows from library (immediate payment, wallet verify, APM's processes).
 */
export default class Payment {
  private _cardinalCommerceCacheToken: string;
  private _notification: Notification;
  private _stTransport: StTransport;
  private _validation: Validation;
  private _processPaymentRequestBody: IStRequest;
  private _threeDInitRequestBody: IStRequest;
  private _threeDQueryRequestBody: IStRequest;
  private readonly _walletVerifyRequest: IStRequest;

  constructor(jwt: string, gatewayUrl: string, parentOrigin?: string) {
    this._notification = new Notification();
    this._stTransport = new StTransport({ jwt, gatewayUrl }, parentOrigin);
    this._validation = new Validation();
    this._walletVerifyRequest = {
      requesttypedescriptions: ['WALLETVERIFY']
    };
    this._threeDInitRequestBody = {
      requesttypedescriptions: ['JSINIT']
    };
  }

  /**
   * Change cardinalCommerceCacheToken during bypass process.
   * @param cachetoken
   */
  public byPassInitRequest(cachetoken: string) {
    this._cardinalCommerceCacheToken = cachetoken;
  }

  /**
   * Triggers common payment process.
   * @param requestTypes
   * @param payment
   * @param merchantData
   * @param additionalData
   */
  private _processPayment(
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
    return this._stTransport.sendRequest(this._processPaymentRequestBody).then(({ response }: any) => response);
  }

  public controlFrameFlow(
    requestTypes: string[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    additionalData: any
  ) {
    this._processPayment(requestTypes, payment, merchantData, additionalData)
      .then((respData: object) => {
        this._notification.success(Language.translations.PAYMENT_SUCCESS);
        this._validation.blockForm(false);
        return respData;
      })
      .catch(() => {
        this._notification.error(Language.translations.PAYMENT_ERROR);
      });
  }

  public processPaymentVisaCheckout() {}

  public processPaymentonApplePay() {}

  /**
   * Triggers 3DInitRequest and save cardinalCommerceCacheToken.
   */
  public threeDInitRequest() {
    return this._stTransport.sendRequest(this._threeDInitRequestBody).then((result: any) => {
      this._cardinalCommerceCacheToken = result.response.cachetoken;
      return result;
    });
  }

  /**
   * Triggers 3DQueryProcess.
   * @param requestTypes
   * @param card
   * @param merchantData
   */
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

  /**
   * Triggers ApplePay wallet verify process.
   * @param walletVerify
   */
  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}

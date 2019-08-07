import { IStRequest } from '../classes/StCodec.class';
import StTransport from '../classes/StTransport.class';
import { IMerchantData } from '../models/MerchantData';
import Notification from './Notification';
import { StJwt } from './StJwt';
import Validation from './Validation';

/**
 * Gathers all payment processes and flows from library (immediate payment, wallet verify, APM's processes).
 */
export default class Payment {
  private _cardinalCommerceCacheToken: string;
  private _notification: Notification;
  private _processPaymentRequestBody: IStRequest;
  private _stTransport: StTransport;
  private _threeDInitRequestBody: IStRequest;
  private _threeDQueryRequestBody: IStRequest;
  private _validation: Validation;
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

  /**
   * Triggers 3DInitRequest and save cardinalCommerceCacheToken.
   */
  public threeDInitRequest() {
    return this._stTransport.sendRequest(this._threeDInitRequestBody).then((result: { jwt: string; response: any }) => {
      const {
        payload: { jwt, response }
      } = new StJwt(result.jwt);
      const threeDInitResult = { jwt, response: response[0] };
      // @ts-ignore
      this._cardinalCommerceCacheToken = threeDInitResult.response.cachetoken;
      return threeDInitResult;
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

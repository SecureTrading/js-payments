import { IStRequest } from '../classes/StCodec.class';
import { StJwt, StJwtPayload } from './StJwt';
import StTransport from '../classes/StTransport.class';
import MessageBus from './MessageBus';

export default class Payment {
  private _stTransport: StTransport;
  private _stJwtDecode: any;
  private readonly _stJwtPayload: StJwtPayload;
  private _messageBus: MessageBus;
  private _cardinalCommerceCacheToken: string;

  constructor(jwt: string) {
    this._stTransport = new StTransport({ jwt: jwt });
    this._stJwtDecode = new StJwt(jwt);
    this._stJwtPayload = this._stJwtDecode.payload;
    this._messageBus = new MessageBus();
  }

  public tokenizeCard(card: Card): Promise<object> {
    let requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'CACHETOKENISE'
      },
      this._stJwtPayload,
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }

  public authorizePayment(card: Card, threeDResponse: string) {
    let requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'AUTH',
        threedresponse: threeDResponse
      },
      this._stJwtPayload,
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }

  public threeDInitRequest() {
    let requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'THREEDINIT'
      },
      this._stJwtPayload
    );

    return this._stTransport.sendRequest(requestBody).then(responseBody => {
      // @ts-ignore
      this._cardinalCommerceCacheToken = responseBody.cachetoken;
      return responseBody;
    });
  }

  public threeDQueryRequest(card: Card): Promise<object> {
    let requestBody: IStRequest = Object.assign(
      {
        requesttypedescription: 'THREEDQUERY',
        termurl: 'https://termurl.com',
        cachetoken: this._cardinalCommerceCacheToken
      },
      card
    );

    return this._stTransport.sendRequest(requestBody);
  }
}

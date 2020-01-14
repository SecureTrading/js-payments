import { IStTransportParams } from '../models/StTransport';
import Utils from '../shared/Utils';
import { IStRequest, StCodec } from './StCodec.class';

export class StTransport {
  public get codec() {
    return this._codec;
  }

  private static DEFAULT_FETCH_OPTIONS = {
    headers: {
      Accept: StCodec.CONTENT_TYPE,
      'Content-Type': StCodec.CONTENT_TYPE
    },
    method: 'post'
  };

  private static DELAY = 1000;
  private static RETRY_LIMIT = 5;
  private static RETRY_TIMEOUT = 10000;
  private static TIMEOUT = 10000;
  private readonly _codec: StCodec;
  private _gatewayUrl: string;

  constructor(params: IStTransportParams, parentOrigin?: string) {
    this._gatewayUrl = params.gatewayUrl;
    this._codec = new StCodec(params.jwt, parentOrigin);
  }

  public async sendRequest(requestObject: IStRequest) {
    return this._fetchRetry(this._gatewayUrl, {
      ...StTransport.DEFAULT_FETCH_OPTIONS,
      body: this._codec.encode(requestObject)
    })
      .then(this._codec.decode)
      .catch(() => {
        return this._codec.decode({});
      });
  }

  private _fetchRetry(
    url: string,
    options: object,
    connectTimeout = StTransport.TIMEOUT,
    delay = StTransport.DELAY,
    retries = StTransport.RETRY_LIMIT,
    retryTimeout = StTransport.RETRY_TIMEOUT
  ) {
    return Utils.retryPromise(
      () => Utils.promiseWithTimeout<Response>(() => fetch(url, options), connectTimeout),
      delay,
      retries,
      retryTimeout
    );
  }
}

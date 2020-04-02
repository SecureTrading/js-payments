import { IStTransportParams } from '../models/IStTransportParams';
import { Utils } from '../shared/Utils';
import { IStRequest, StCodec } from './StCodec.class';

/**
 * Establishes connection with ST, defines client.
 * example usage:
 *   st.sendRequest({
 *     accounttypedescription: 'ECOM',
 *     expirydate: '01/20',
 *     pan: '4111111111111111',
 *     requesttypedescription: 'AUTH',
 *     securitycode: '123',
 *     sitereference: 'test_james38641'
 *   }).then();
 */
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

  public static readonly THROTTLE_TIME = 250;
  private static DELAY = 1000;
  private static RETRY_LIMIT = 5;
  private static RETRY_TIMEOUT = 10000;
  private static TIMEOUT = 10000;
  private readonly _codec: StCodec;
  private _gatewayUrl: string;
  private _throttlingRequests = new Map<string, Promise<object>>();

  constructor(params: IStTransportParams) {
    this._gatewayUrl = params.gatewayUrl;
    this._codec = new StCodec(params.jwt);
  }

  /**
   * Perform a JSON API request with ST
   * @param requestObject A request object to send to ST
   * @return A Promise object that resolves the gateway response
   */
  public async sendRequest(requestObject: IStRequest): Promise<object> {
    const requestBody = this._codec.encode(requestObject);

    if (!this._throttlingRequests.has(requestBody)) {
      this._throttlingRequests.set(requestBody, this.sendRequestInternal(requestBody));
      setTimeout(() => this._throttlingRequests.delete(requestBody), StTransport.THROTTLE_TIME);
    }

    return this._throttlingRequests.get(requestBody);
  }

  private sendRequestInternal(requestBody: string): Promise<object> {
    return this._fetchRetry(this._gatewayUrl, {
      ...StTransport.DEFAULT_FETCH_OPTIONS,
      body: requestBody
    })
      .then(this._codec.decode)
      .catch(() => {
        return this._codec.decode({});
      });
  }

  /**
   * Fetch with timeout and retry
   * We probably want to update this to use an AbortControllor once this is standardised in the future
   * @param url The URL to be passed to the fetch request
   * @param options The options object to be passed to the fetch request
   * @param connectTimeout The time (ms) after which to time out
   * @param delay The delay for the retry
   * @param retries The number of retries
   * @param retryTimeout The longest amount of time to spend retrying
   * @return A Promise that resolves to a fetch response or rejects with an error
   * @private
   */
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

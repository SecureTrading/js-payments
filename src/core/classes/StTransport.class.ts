import { environment } from '../../environments/environment';
import Utils from '../shared/Utils';
import { IStRequest, StCodec } from './StCodec.class';

export interface IStTransportParams {
  jwt: string;
  gatewayUrl?: string;
}

/***
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
export default class StTransport {
  /**
   * Getter for the codec
   */
  public get codec() {
    return this._codec;
  }
  public static GATEWAY_URL = environment.GATEWAY_URL;
  public static DEFAULT_FETCH_OPTIONS = {
    headers: {
      Accept: StCodec.CONTENT_TYPE,
      'Content-Type': StCodec.CONTENT_TYPE
    },
    method: 'post'
  };
  public static TIMEOUT = 10000;
  public static DELAY = 1000;
  public static RETRY_LIMIT = 5;
  public static RETRY_TIMEOUT = 10000;

  private gatewayUrl: string;
  private _codec: StCodec;

  constructor(params: IStTransportParams) {
    this.gatewayUrl = 'gatewayUrl' in params ? params.gatewayUrl : StTransport.GATEWAY_URL;
    this._codec = new StCodec(params.jwt);
  }

  /**
   * Perform a JSON API request with ST
   * @param requestObject A request object to send to ST
   * @return A Promise object that resolves the gateway response
   */
  public async sendRequest(requestObject: IStRequest) {
    return this.fetchRetry(this.gatewayUrl, {
      ...StTransport.DEFAULT_FETCH_OPTIONS,
      body: this._codec.encode(requestObject)
    })
      .then(this._codec.decode)
      .catch(e => {
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
   */
  public fetchRetry(
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

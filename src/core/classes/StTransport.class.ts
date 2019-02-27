import Language from './Language.class';
import { IStRequest, StCodec } from './StCodec.class';

interface IStTransportParams {
  jwt: string;
  gatewayUrl?: string;
}

/***
 * Establishes connection with ST, defines client.
 */
class StTransport {
  public static GATEWAY_URL = 'https://webservices.securetrading.net';
  public static DEFAULT_FETCH_OPTIONS = {
    headers: {
      'Accept': StCodec.CONTENT_TYPE,
      'Content-Type': StCodec.CONTENT_TYPE
    },
    method: 'post'
  };
  public static TIMEOUT = 60000;
  private gatewayUrl: string;
  private _codec: StCodec;

  public get codec() {
    return this._codec;
  }

  constructor(params: IStTransportParams) {
    this.gatewayUrl =
      'gatewayUrl' in params ? params.gatewayUrl : StTransport.GATEWAY_URL;
    this._codec = new StCodec(params.jwt);
  }

  /**
   * Perform a JSON API request with ST
   */
  public sendRequest(requestObject: IStRequest) {
    return this.fetchTimeout(this.gatewayUrl, {
      ...StTransport.DEFAULT_FETCH_OPTIONS,
      body: this._codec.encode(requestObject)
    }).then(responseObject => this._codec.decode(responseObject));
  }

  /**
   * Fetch with a timeout to reject the request
   * We probably want to update this to use an AbortControllor once this is standardised in the future
   */
  public fetchTimeout(
    url: string,
    options: object,
    timeout = StTransport.TIMEOUT
  ) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT)
            ),
          timeout
        )
      )
    ]);
  }
}

export default StTransport;

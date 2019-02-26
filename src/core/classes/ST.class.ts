import Language from './Language.class';
/***
 * Establishes connection with ST, defines client.
 */
class ST {
  public static API_URL = 'https://webservices.securetrading.net';
  public static CONTENT_TYPE = 'application/json';
  public static HEADERS = {
    'Accept': ST.CONTENT_TYPE,
    'Content-Type': ST.CONTENT_TYPE
  };
  public static REQUEST_METHOD = 'post';
  public static TIMEOUT = 60000;
  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  constructor(id: string) {
    this._id = id;
  }

  /**
   * Perform a JSON API request with ST
   */
  public sendRequest(requestObject: object) {
    return this.fetchTimeout(ST.API_URL, {
      body: JSON.stringify(requestObject),
      headers: ST.HEADERS,
      method: ST.REQUEST_METHOD
    }).then(responseJson => {
      if ('json' in responseJson) {
        return responseJson.json();
      }
      throw new Error(
        Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
      );
    });
  }

  /**
   * Fetch with a timeout to reject the request
   * We probably want to update this to use an AbortControllor once this is standardised in the future
   */
  public fetchTimeout(url: string, options: object, timeout = ST.TIMEOUT) {
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

export default ST;

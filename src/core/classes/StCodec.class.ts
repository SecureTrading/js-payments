import Language from './Language.class';

interface IStRequest {
  requesttypedescription: string;
  pan?: string;
}

class StCodec {
  public static CONTENT_TYPE = 'application/json';
  public static VERSION = '1.00';
  public static SUPPORTED_REQUEST_TYPES = [
    'WALLETVERIFY',
    'THREEDINIT',
    'THREEDQUERY',
    'CACHETOKENISE',
    'AUTH'
  ];
  private _requestId: string;
  private _jwt: string;
  constructor(jwt: string) {
    this._requestId = this._createRequestId();
    this._jwt = jwt;
  }

  public _createRequestId(length = 8) {
    return (
      'J-' +
      Math.random()
        .toString(36)
        .substring(2, 2 + length)
    );
  }

  public buildRequestObject(requestData: object): object {
    return {
      request: [
        {
          ...requestData,
          jwt: this._jwt,
          requestid: this._requestId
        }
      ],
      version: StCodec.VERSION
    };
  }

  public encode(requestObject: IStRequest) {
    if (
      Object.keys(requestObject).length < 2 ||
      !StCodec.SUPPORTED_REQUEST_TYPES.includes(
        requestObject.requesttypedescription
      )
    ) {
      throw new Error(
        Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST
      );
    }
    return JSON.stringify(this.buildRequestObject(requestObject));
  }

  public decode(responseObject: Response | {}) {
    if ('json' in responseObject) {
      return responseObject.json();
    }
    throw new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
  }
}

export { StCodec, IStRequest };

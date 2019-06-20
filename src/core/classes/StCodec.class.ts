import JwtDecode from 'jwt-decode';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import Validation from '../shared/Validation';

interface IStRequest {
  requesttypedescription?: string;
  requesttypedescriptions?: string[];
  expirydate?: string;
  pan?: string;
  securitycode?: string;
  termurl?: string; // TODO shouldn't be needed for CC request but this needs to wait for 153 release
}

/**
 * Encodes and Decodes a request for the ST gateway
 */
class StCodec {
  public static CONTENT_TYPE = 'application/json';
  public static VERSION = '1.00';
  public static SUPPORTED_REQUEST_TYPES = [
    'WALLETVERIFY',
    'JSINIT',
    'THREEDQUERY',
    'CACHETOKENISE',
    'AUTH',
    'ERROR',
    'RISKDEC',
    'SUBSCRIPTION'
  ]; // TODO update to support other request types - basically should match ppages?
  public static MINIMUM_REQUEST_FIELDS = 1;

  /**
   * Generate a unique ID for a request
   * (this is informational. it doesn't need to be cryptographically random since one of those is allocated server-side)
   * @param length The total length of the Request ID
   *   (since we prepend 'J-' the random section will be 2 char shorter)
   * @return A newly generated random request ID
   */
  public static _createRequestId(length = 10) {
    return (
      'J-' +
      Math.random()
        .toString(36)
        .substring(2, length)
    );
  }

  public static getErrorData(data: any) {
    const { errordata, errormessage, requesttypedescription } = data;
    return {
      errordata,
      errormessage,
      requesttypedescription
    };
  }

  /**
   * Verify the response from the gateway
   * @param responseData The response from the gateway
   * @return The content of the response that can be used in the following processes
   */
  public static verifyResponseObject(responseData: any, jwtResponse: string): object {
    // Ought we keep hold of the requestreference (eg. log it to console)
    // So that we can link these requests up with the gateway?
    const validation = new Validation();
    const translator = new Translator(StCodec._locale);
    if (!(responseData && responseData.version === StCodec.VERSION && responseData.response)) {
      StCodec.publishResponse(StCodec._createCommunicationError());
      StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
      throw new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    }
    let responseContent: IResponseData;
    responseData.response.forEach((r: any) => {
      // TODO unittest
      if (r.customeroutput) {
        responseContent = r;
      }
    });
    responseContent.errormessage = translator.translate(responseContent.errormessage);
    if (StCodec.REQUESTS_WITH_ERROR_MESSAGES.includes(responseContent.requesttypedescription)) {
      if (responseContent.errorcode !== StCodec.STATUS_CODES.ok) {
        if (responseContent.errorcode === StCodec.STATUS_CODES.invalidfield) {
          validation.getErrorData(StCodec.getErrorData(responseContent));
        }
        validation.blockForm(false);
        StCodec.publishResponse(responseContent, jwtResponse);
        StCodec._notification.error(responseContent.errormessage);
        throw new Error(responseContent.errormessage);
      }
    }
    StCodec.publishResponse(responseContent, jwtResponse);
    return responseContent;
  }

  private static _notification = new Notification();
  private static _locale: string;
  private static _messageBus = new MessageBus();
  private static _parentOrigin: string;
  // TODO do we want to update this?
  private static REQUESTS_WITH_ERROR_MESSAGES = ['AUTH', 'CACHETOKENISE', 'ERROR', 'THREEDQUERY', 'WALLETVERIFY'];
  private static STATUS_CODES = { invalidfield: '30000', ok: '0', declined: '70000' };

  private static publishResponse(responseData: IResponseData, jwtResponse?: string) {
    const translator = new Translator(StCodec._locale);
    responseData.errormessage = translator.translate(responseData.errormessage);
    const eventData = { ...responseData };
    if (jwtResponse !== undefined) {
      eventData.stjwt = jwtResponse;
    }
    const notificationEvent: IMessageBusEvent = {
      data: eventData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
    };
    if (StCodec._parentOrigin !== undefined) {
      StCodec._messageBus.publish(notificationEvent, true);
    } else {
      StCodec._messageBus.publishToSelf(notificationEvent);
    }
  }

  private static _createCommunicationError() {
    return {
      errorcode: '50003',
      errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
    } as IResponseData;
  }

  private readonly _requestId: string;
  private readonly _jwt: string;

  constructor(jwt: string, parentOrigin?: string) {
    this._requestId = StCodec._createRequestId();
    this._jwt = jwt;
    StCodec._locale = new StJwt(this._jwt).locale;
    StCodec._parentOrigin = parentOrigin;
    if (parentOrigin) {
      StCodec._messageBus = new MessageBus(parentOrigin);
    }
  }

  /**
   * Add the wrapper data to the request object
   * @param requestData The data to be contained in this request
   * @return A JS object ready to be encoded
   */
  public buildRequestObject(requestData: object): object {
    return {
      acceptcustomeroutput: '1.00',
      jwt: this._jwt,
      request: [
        {
          ...requestData,
          requestid: this._requestId,
          sitereference: new StJwt(this._jwt).sitereference
        }
      ],
      version: StCodec.VERSION
    };
  }

  /**
   * Encode the request to send to the gateway
   * includes simple validation so we don't send utterly invalid requests
   * @param requestObject The data to be contained in the request
   * @return A JSON string for the fetch request body
   */
  public encode(requestObject: IStRequest) {
    if (
      Object.keys(requestObject).length < StCodec.MINIMUM_REQUEST_FIELDS ||
      // TODO update unittest
      !requestObject.requesttypedescriptions.every(val => StCodec.SUPPORTED_REQUEST_TYPES.includes(val))
    ) {
      StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST);
      throw new Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST);
    }
    return JSON.stringify(this.buildRequestObject(requestObject));
  }

  /**
   * Decode the Json body from the fetch response
   * @Param responseObject The response object from the fetch promise
   * @return A Promise that resolves the body content (or raise an error casing the fetch to be rejected)
   */
  public decode(responseObject: Response | {}): Promise<object> {
    return new Promise((resolve, reject) => {
      if ('json' in responseObject) {
        responseObject.json().then(responseData => {
          const decodedResponseData = JwtDecode(responseData.jwt) as any; // TODO type?
          resolve(StCodec.verifyResponseObject(decodedResponseData.payload, responseData.jwt));
        });
      } else {
        StCodec.publishResponse(StCodec._createCommunicationError());
        StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
        reject(new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
      }
    });
  }
}

export { StCodec, IStRequest };

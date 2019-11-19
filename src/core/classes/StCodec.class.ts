import JwtDecode from 'jwt-decode';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import Selectors from '../shared/Selectors';
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
    'SUBSCRIPTION',
    'ACCOUNTCHECK'
  ];
  public static MINIMUM_REQUEST_FIELDS = 1;
  public static jwt: string;
  public static originalJwt: string;

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

  /**
   * Returns error data with error message and request type description.
   * @param data
   */
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
    if (StCodec._isInvalidResponse(responseData)) {
      throw StCodec._handleInvalidResponse();
    }
    const responseContent: IResponseData = StCodec._determineResponse(responseData);
    StCodec._handleValidGatewayResponse(responseContent, jwtResponse);
    return responseContent;
  }

  /** Publishes translated response as a TRANSACTION_COMPLETE event
   * to allow the page to submit to the merchant server
   * @param responseData The decoded response from the gateway
   * @param jwtResponse The raw JWT response from the gateway
   * @param threedresponse the response from Cardinal commerce after call to ACS
   */
  public static publishResponse(responseData: IResponseData, jwtResponse?: string, threedresponse?: string) {
    console.error('publishResponse');
    console.error(jwtResponse);
    console.error(responseData);
    const translator = new Translator(StCodec._locale);
    responseData.errormessage = translator.translate(responseData.errormessage);
    const eventData = { ...responseData };
    if (jwtResponse !== undefined) {
      eventData.jwt = jwtResponse;
    }
    if (threedresponse !== undefined) {
      eventData.threedresponse = threedresponse;
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

  /**
   * Changes JWT on demand.
   * @param newJWT
   */
  public static updateJWTValue(newJWT: string) {
    StCodec.jwt = newJWT ? newJWT : StCodec.jwt;
    StCodec.originalJwt = newJWT ? newJWT : StCodec.originalJwt;
    const messageBusEvent: IMessageBusEvent = {
      data: {
        newJwt: StCodec.jwt
      },
      type: MessageBus.EVENTS_PUBLIC.UPDATE_JWT
    };
    StCodec._messageBus.publish(messageBusEvent, true);
    StCodec._messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private static _notification = new Notification();
  private static _locale: string;
  private static _messageBus = new MessageBus();
  private static _parentOrigin: string;
  private static REQUESTS_WITH_ERROR_MESSAGES = [
    'AUTH',
    'CACHETOKENISE',
    'ERROR',
    'THREEDQUERY',
    'WALLETVERIFY',
    'RISKDEC',
    'SUBSCRIPTION',
    'ACCOUNTCHECK'
  ];
  private static STATUS_CODES = { invalidfield: '30000', ok: '0', declined: '70000' };

  /**
   * Returns 50003 communication error.
   * @private
   */
  private static _createCommunicationError() {
    return {
      errorcode: '50003',
      errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
    } as IResponseData;
  }

  /**
   * Blocks form, returns an error and set notification after invalid response.
   * @private
   */
  private static _handleInvalidResponse() {
    const validation = new Validation();
    StCodec.publishResponse(StCodec._createCommunicationError());
    StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    validation.blockForm(false);
    return new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
  }

  /**
   * Checks if response has invalid status by checking version response length and if they're not undefined.
   * @param responseData
   * @private
   */
  private static _isInvalidResponse(responseData: any) {
    return !(
      responseData &&
      responseData.version === StCodec.VERSION &&
      responseData.response &&
      responseData.response.length > 0
    );
  }

  /**
   * Returns response content, if it's not specified after checkin customeroutput assigns first one.
   * @param responseData
   * @private
   */
  private static _determineResponse(responseData: any) {
    let responseContent: IResponseData;
    responseData.response.forEach((r: any) => {
      if (r.customeroutput) {
        responseContent = r;
      }
    });
    if (!responseContent) {
      responseContent = responseData.response[responseData.response.length - 1];
    }
    return responseContent;
  }

  /**
   * Blocks form, returns an error and set notification after valid gateway response.
   * Publishes response and set proper validation.
   * @param responseContent
   * @param jwtResponse
   * @private
   */
  private static _handleValidGatewayResponse(responseContent: IResponseData, jwtResponse: string) {
    const translator = new Translator(StCodec._locale);
    const validation = new Validation();
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
  }

  /**
   * Decodes JWT using jwt-decode library.
   * @param jwt
   * @param reject
   * @private
   */
  private static _decodeResponseJwt(jwt: string, reject: (error: Error) => void) {
    let decoded: any;
    try {
      decoded = JwtDecode(jwt) as any;
    } catch (e) {
      reject(StCodec._handleInvalidResponse());
    }
    return decoded;
  }

  private readonly _requestId: string;

  constructor(jwt: string, parentOrigin?: string) {
    this._requestId = StCodec._createRequestId();
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
    StCodec._locale = new StJwt(StCodec.jwt).locale;
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
      jwt: StCodec.jwt,
      request: [
        {
          ...requestData,
          requestid: this._requestId,
          sitereference: new StJwt(StCodec.jwt).sitereference
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
  public async decode(responseObject: Response | {}): Promise<object> {
    let decoded: any;
    const promise = await new Promise((resolve, reject) => {
      if ('json' in responseObject) {
        responseObject.json().then(responseData => {
          decoded = StCodec._decodeResponseJwt(responseData.jwt, reject);
          if (decoded && decoded.payload.response[0].errorcode === '0') {
            StCodec.jwt = decoded.payload.jwt;
          } else {
            StCodec.jwt = StCodec.originalJwt;
          }
          resolve({
            jwt: responseData.jwt,
            response: StCodec.verifyResponseObject(decoded.payload, responseData.jwt)
          });
        });
      } else {
        StCodec.jwt = StCodec.originalJwt;
        reject(StCodec._handleInvalidResponse());
      }
    });
    // @ts-ignore
    return promise;
  }
}

export { StCodec, IStRequest };

import JwtDecode from 'jwt-decode';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IResponseData } from '../models/IResponseData';
import { IStRequest } from '../models/IStRequest';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Notification } from '../shared/Notification';
import { Selectors } from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import { Validation } from '../shared/Validation';

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
  public static _createRequestId(length = 10): string {
    return (
      'J-' +
      Math.random()
        .toString(36)
        .substring(2, length)
    );
  }

  public static getErrorData(data: IResponseData): IResponseData {
    const { errorcode, errordata, errormessage, requesttypedescription } = data;
    return {
      errorcode,
      errordata,
      errormessage,
      requesttypedescription
    };
  }

  public static verifyResponseObject(responseData: string, jwtResponse: string): IResponseData {
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
  public static publishResponse(responseData: IResponseData, jwtResponse?: string, threedresponse?: string): void {
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

  public static updateJWTValue(newJWT: string): void {
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

  private static _createCommunicationError(): IResponseData {
    return {
      errorcode: '50003',
      errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
    };
  }

  private static _handleInvalidResponse(): Error {
    const validation = new Validation();
    StCodec.publishResponse(StCodec._createCommunicationError());
    StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    validation.blockForm(false);
    return new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
  }

  private static _isInvalidResponse(responseData: any) {
    return !(
      responseData &&
      responseData.version === StCodec.VERSION &&
      responseData.response &&
      responseData.response.length > 0
    );
  }

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

  private static _handleValidGatewayResponse(responseContent: IResponseData, jwtResponse: string): void {
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

  private static _decodeResponseJwt(jwt: string, reject: (error: Error) => void): string {
    let decoded: string;
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

  public encode(requestObject: IStRequest): string {
    if (
      Object.keys(requestObject).length < StCodec.MINIMUM_REQUEST_FIELDS ||
      !requestObject.requesttypedescriptions.every(val => StCodec.SUPPORTED_REQUEST_TYPES.includes(val))
    ) {
      StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST);
      throw new Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST);
    }
    return JSON.stringify(this.buildRequestObject(requestObject));
  }

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

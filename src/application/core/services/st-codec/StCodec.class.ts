import JwtDecode from 'jwt-decode';
import { FormState } from '../../models/constants/FormState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IResponseData } from '../../models/IResponseData';
import { IStRequest } from '../../models/IStRequest';
import {
  COMMUNICATION_ERROR_INVALID_RESPONSE,
  COMMUNICATION_ERROR_INVALID_REQUEST
} from '../../models/constants/Translations';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { StJwt } from '../../shared/stjwt/StJwt';
import { Translator } from '../../shared/translator/Translator';
import { Validation } from '../../shared/validation/Validation';
import { version } from '../../../../../package.json';
import { Container } from 'typedi';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { Frame } from '../../shared/frame/Frame';

export class StCodec {
  public static CONTENT_TYPE = 'application/json';
  public static VERSION = '1.00';
  public static VERSION_INFO = `STJS::N/A::${version}::N/A`;
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
    return 'J-' + Math.random().toString(36).substring(2, length);
  }

  public static getErrorData(data: any) {
    const { errordata, errormessage, requesttypedescription } = data;
    return {
      errordata,
      errormessage,
      requesttypedescription
    };
  }

  public static verifyResponseObject(responseData: any, jwtResponse: string): object {
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
    StCodec.getMessageBus().publish(notificationEvent, true);
  }

  public static updateJWTValue(newJWT: string) {
    StCodec.jwt = newJWT ? newJWT : StCodec.jwt;
    StCodec.originalJwt = newJWT ? newJWT : StCodec.originalJwt;
    const messageBusEvent: IMessageBusEvent = {
      data: {
        newJwt: StCodec.jwt
      },
      type: MessageBus.EVENTS_PUBLIC.UPDATE_JWT
    };
    StCodec.getMessageBus().publish(messageBusEvent, true);
  }

  private static _notification: NotificationService;
  private static _messageBus: MessageBus;
  private static _frame: Frame;
  private static _locale: string;
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

  private static getMessageBus(): MessageBus {
    return StCodec._messageBus || (StCodec._messageBus = Container.get(MessageBus));
  }

  private static getNotification(): NotificationService {
    return StCodec._notification || (StCodec._notification = Container.get(NotificationService));
  }

  private static getFrameService(): Frame {
    return StCodec._frame || (StCodec._frame = Container.get(Frame));
  }

  private static _createCommunicationError() {
    return {
      errorcode: '50003',
      errormessage: COMMUNICATION_ERROR_INVALID_RESPONSE
    } as IResponseData;
  }

  private static _handleInvalidResponse() {
    const validation = new Validation();
    StCodec.publishResponse(StCodec._createCommunicationError());
    StCodec.getNotification().error(COMMUNICATION_ERROR_INVALID_RESPONSE);
    validation.blockForm(FormState.AVAILABLE);
    StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);

    return new Error(COMMUNICATION_ERROR_INVALID_RESPONSE);
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

  private static _handleValidGatewayResponse(responseContent: IResponseData, jwtResponse: string) {
    const translator = new Translator(StCodec._locale);
    const validation = new Validation();

    const { errorcode, errormessage, requesttypedescription } = responseContent;

    const errormessageTranslated = translator.translate(errormessage);

    if (!StCodec.REQUESTS_WITH_ERROR_MESSAGES.includes(requesttypedescription)) {
      return;
    }

    if (errorcode === StCodec.STATUS_CODES.ok) {
      StCodec.publishResponse(responseContent, jwtResponse);
      return;
    }

    if (responseContent.walletsource && responseContent.walletsource === 'APPLEPAY') {
      StCodec.getNotification().error(errormessageTranslated);
      StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
      StCodec.publishResponse(responseContent, jwtResponse);
      return;
    }

    if (errorcode === StCodec.STATUS_CODES.invalidfield) {
      validation.getErrorData(StCodec.getErrorData(responseContent));
    }

    validation.blockForm(FormState.AVAILABLE);
    StCodec.getNotification().error(errormessageTranslated);
    StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    StCodec.publishResponse(responseContent, jwtResponse);
    throw new Error(errormessage);
  }

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

  constructor(jwt: string) {
    this._requestId = StCodec._createRequestId();
    StCodec._notification = Container.get(NotificationService);
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
    StCodec._locale = new StJwt(StCodec.jwt).locale;
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
      version: StCodec.VERSION,
      versioninfo: StCodec.VERSION_INFO
    };
  }

  public encode(requestObject: IStRequest) {
    if (
      Object.keys(requestObject).length < StCodec.MINIMUM_REQUEST_FIELDS ||
      !requestObject.requesttypedescriptions.every(val => StCodec.SUPPORTED_REQUEST_TYPES.includes(val))
    ) {
      StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
      StCodec.getNotification().error(COMMUNICATION_ERROR_INVALID_REQUEST);
      throw new Error(COMMUNICATION_ERROR_INVALID_REQUEST);
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

import { environment } from '../../environments/environment';
import {
  IAuthorizePaymentResponse,
  IOnCardinalValidated,
  IThreeDInitResponse,
  IThreeDQueryResponse,
  ON_CARDINAL_VALIDATED_STATUS,
  PAYMENT_BRAND,
  PAYMENT_EVENTS
} from '../models/CardinalCommerce';
import { INotificationEvent, NotificationType } from '../models/NotificationEvent';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';

declare const Cardinal: any;

/**
 * Cardinal Commerce class:
 * Defines integration with Cardinal Commerce and flow of transaction with this supplier.
 */
export class CardinalCommerce {
  /**
   * Check if card is enrolled and non frictionless
   * @param response
   * @private
   */
  private static _isCardEnrolledAndNotFrictionless(response: IThreeDQueryResponse) {
    return response.enrolled === 'Y' && response.acsurl !== undefined;
  }

  public messageBus: MessageBus;
  private _cardinalCommerceJWT: string;
  private _cardinalCommerceCacheToken: string;
  private _cachetoken: string;
  private _threedQueryTransactionReference: string;
  private readonly _startOnLoad: boolean;
  private _jwt: string;
  private _requestTypes: string[];
  private _threedinit: string;

  constructor(startOnLoad: boolean, jwt: string, requestTypes: string[], cachetoken?: string, threedinit?: string) {
    this._startOnLoad = startOnLoad;
    this._jwt = jwt;
    this._threedinit = threedinit;
    this._cachetoken = cachetoken ? cachetoken : '';
    this._requestTypes = requestTypes;
    this.messageBus = new MessageBus();
    this._onInit();
  }

  /**
   * Send postMessage to notificationFrame component, to inform user about payment status
   * @param type
   * @param content
   */
  public setNotification(type: string, content: string) {
    // @TODO STJS-205 refactor into Payments
    const notificationEvent: INotificationEvent = {
      content,
      type
    };
    const messageBusEvent: IMessageBusEvent = {
      data: notificationEvent,
      type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.NOTIFICATION_FRAME_IFRAME);
  }

  /**
   * Handles continue action from Cardinal Commerce, retrieve overlay with iframe which target is on AcsUrl
   * and handles the rest of process.
   * Cardinal.continue(PAYMENT_BRAND, CONTINUE_DATA, ORDER_OBJECT, NEW_JWT)
   */
  protected _authenticateCard(responseObject: IThreeDQueryResponse) {
    this._threedQueryTransactionReference = responseObject.transactionreference;
    Cardinal.continue(
      PAYMENT_BRAND,
      {
        AcsUrl: responseObject.acsurl,
        Payload: responseObject.threedpayload
      },
      {
        Cart: [],
        OrderDetails: { TransactionId: responseObject.acquirertransactionreference }
      },
      this._cardinalCommerceJWT
    );
  }

  /**
   * Initiate configuration of Cardinal Commerce
   * Initialize Cardinal Commerce mechanism with given JWT (by merchant).
   */
  protected _onCardinalLoad() {
    Cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);
    Cardinal.on(PAYMENT_EVENTS.SETUP_COMPLETE, () => {
      this._onCardinalSetupComplete();
    });
    Cardinal.on(PAYMENT_EVENTS.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
      this._onCardinalValidated(data, jwt);
    });

    Cardinal.setup(PAYMENT_EVENTS.INIT, {
      jwt: this._cardinalCommerceJWT
    });
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occurred during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  protected _onCardinalSetupComplete() {
    if (this._startOnLoad) {
      const pan = new StJwt(this._jwt).payload.pan as string;
      this._performBinDetection({ validity: true, value: pan });
      const submitFormEvent: IMessageBusEvent = {
        data: { dataInJwt: true, requestTypes: this._requestTypes },
        type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
      };
      this.messageBus.publishFromParent(submitFormEvent, Selectors.CONTROL_FRAME_IFRAME);
    } else {
      const messageBusEvent: IMessageBusEvent = {
        type: MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL
      };
      this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BIN_PROCESS, this._performBinDetection);
      this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
    }
  }

  /**
   * Triggered when the transaction has been finished.
   */
  protected _onCardinalValidated(data: IOnCardinalValidated, jwt: string) {
    const { ActionCode, ErrorNumber, ErrorDescription } = data;
    const translator = new Translator(new StJwt(this._jwt).locale);
    let errorNum: any = ErrorNumber;
    if (errorNum !== undefined) {
      errorNum = errorNum.toString();
    }
    const responseData: IResponseData = {
      acquirerresponsecode: errorNum,
      acquirerresponsemessage: ErrorDescription,
      errorcode: '50003',
      errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
    };
    responseData.errormessage = translator.translate(responseData.errormessage);
    const notificationEvent: IMessageBusEvent = {
      data: responseData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
    };

    if (ON_CARDINAL_VALIDATED_STATUS.includes(ActionCode)) {
      this._authorizePayment({ threedresponse: jwt });
    } else {
      this.messageBus.publishToSelf(notificationEvent);
      this.setNotification(NotificationType.Error, Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    }
  }

  /**
   * Triggered when the card number bin value changes
   */
  protected _performBinDetection(bin: IFormFieldState) {
    return Cardinal.trigger(PAYMENT_EVENTS.BIN_PROCESS, bin);
  }

  /**
   * Inserts songbird.js and load script.
   */
  protected _threeDSetup() {
    DomMethods.insertScript('head', environment.CARDINAL_COMMERCE.SONGBIRD_URL).addEventListener('load', () => {
      this._onCardinalLoad();
    });
  }

  /**
   * Authorize payment.
   * @param data
   * @private
   */
  private _authorizePayment(data?: IAuthorizePaymentResponse | object) {
    data = data || {};
    if (data) {
      // @ts-ignore
      data.cachetoken = this._cardinalCommerceCacheToken;
      // @ts-ignore
      data.parenttransactionreference = this._threedQueryTransactionReference;
    }

    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Init all subscription methods.
   * @private
   */
  private _initSubscriptions() {
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME, () => {
      this._onLoadControlFrame();
    });
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.THREEDINIT, (data: IThreeDInitResponse) => {
      this._onThreeDInitEvent(data);
    });
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, () => {
      this._onByPassJsInitEvent();
    });
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.THREEDQUERY, (data: any) => {
      this._onThreeDQueryEvent(data);
    });
  }

  /**
   * Publishes message bus set request types event
   */
  private _publishRequestTypesEvent(requestTypes: string[]) {
    const messageBusEvent: IMessageBusEvent = {
      data: { requestTypes },
      type: MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES
    };
    document.getElementById(Selectors.CONTROL_FRAME_IFRAME).addEventListener('load', () => {
      this.messageBus.publish(messageBusEvent);
    });
  }

  /**
   * Call all subscription methods.
   * @private
   */
  private _onInit() {
    this._initSubscriptions();
    this._publishRequestTypesEvent(this._requestTypes);
  }

  /**
   * Call _threeDInitRequest().
   * @private
   */
  private _onLoadControlFrame() {
    if (this._cachetoken) {
      this._byPassInitRequest();
    } else {
      this._threeDInitRequest();
    }
  }

  private _onByPassJsInitEvent() {
    this._cardinalCommerceJWT = this._threedinit;
    this._cardinalCommerceCacheToken = this._cachetoken;
    this._threeDSetup();
  }

  /**
   * Overwrite threedinit and cachetoken fields; call _threeDSetup().
   * @param data
   * @private
   */
  private _onThreeDInitEvent(data: IThreeDInitResponse) {
    const { cachetoken, threedinit } = data;
    this._cardinalCommerceJWT = threedinit;
    this._cardinalCommerceCacheToken = cachetoken;
    this._threeDSetup();
  }

  /**
   * Call _threeDQueryRequest().
   * @param data
   * @private
   */
  private _onThreeDQueryEvent(data: IThreeDQueryResponse) {
    this._threeDQueryRequest(data);
  }

  private _byPassInitRequest() {
    const messageBusEvent: IMessageBusEvent = {
      data: this._cachetoken,
      type: MessageBus.EVENTS_PUBLIC.BY_PASS_INIT
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Perform a THREEDINIT with ST in order to generate the Cardinal songbird JWT.
   * @private
   */
  private _threeDInitRequest() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.THREEDINIT
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Authenticates card or authorize payment.
   * @param responseObject
   * @private
   */
  private _threeDQueryRequest(responseObject: IThreeDQueryResponse) {
    if (CardinalCommerce._isCardEnrolledAndNotFrictionless(responseObject)) {
      this._authenticateCard(responseObject);
    } else {
      this._threedQueryTransactionReference = responseObject.transactionreference;
      this._authorizePayment();
    }
  }
}

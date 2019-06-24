import { environment } from '../../environments/environment';
import {
  IAuthorizePaymentResponse,
  IOnCardinalValidated,
  IThreeDInitResponse,
  IThreeDQueryResponse,
  onCardinalValidatedStatus
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
  private static PAYMENT_BRAND: string = 'cca';
  private static PAYMENT_EVENTS = {
    INIT: 'init',
    SETUP_COMPLETE: 'payments.setupComplete',
    VALIDATED: 'payments.validated'
  };

  /**
   * Check if card is enrolled and nto frictionless.
   * @param response
   * @private
   */
  private static _isCardEnrolledAndNotFrictionless(response: IThreeDQueryResponse) {
    return response.enrolled === 'Y' && response.acsurl !== undefined;
  }

  public messageBus: MessageBus;
  private _cardinalCommerceJWT: string;
  private _cardinalCommerceCacheToken: string;
  private _threedQueryTransactionReference: string;
  private _tokenise: boolean;
  private readonly _startOnLoad: boolean;
  private _jwt: string;

  constructor(tokenise: boolean, startOnLoad: boolean, jwt: string) {
    this._startOnLoad = startOnLoad;
    this._jwt = jwt;
    this._tokenise = tokenise;
    this.messageBus = new MessageBus();
    this._onInit();
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occurred during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  public _onCardinalSetupComplete() {
    if (this._startOnLoad) {
      const pan = new StJwt(this._jwt).payload.pan as string;
      this._performBinDetection({ validity: true, value: pan });
      const submitFormEvent: IMessageBusEvent = {
        data: { dataInJwt: true },
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
   * Triggered when the card number bin value changes
   * @protected
   */
  protected _performBinDetection(bin: IFormFieldState) {
    // Can't be an arrow function as it does not override correctly in CardinalCommerceMock
    return Cardinal.trigger('bin.process', bin);
  }

  /**
   * Triggered when the transaction has been finished.
   * @protected
   */
  protected _onCardinalValidated(data: IOnCardinalValidated, jwt: string) {
    const { ActionCode, ErrorNumber, ErrorDescription } = data;
    const translator = new Translator(new StJwt(this._jwt).locale);
    const responseData: IResponseData = {
      acquirerresponsecode: ErrorNumber,
      acquirerresponsemessage: ErrorDescription,
      errorcode: '50003',
      errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
    };
    responseData.errormessage = translator.translate(responseData.errormessage);
    const notificationEvent: IMessageBusEvent = {
      data: responseData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
    };

    if (onCardinalValidatedStatus.includes(ActionCode)) {
      this._authorizePayment({ threedresponse: jwt });
    } else {
      this.messageBus.publishToSelf(notificationEvent);
      this.setNotification(NotificationType.Error, Language.translations.PAYMENT_ERROR);
    }
  }

  /**
   * Handles continue action from Cardinal Commerce, retrieve overlay with iframe which target is on AcsUrl
   * and handles the rest of process.
   * Cardinal.continue(PAYMENT_BRAND, CONTINUE_DATA, ORDER_OBJECT, NEW_JWT)
   * @protected
   */
  protected _authenticateCard(responseObject: IThreeDQueryResponse) {
    this._threedQueryTransactionReference = responseObject.transactionreference;
    Cardinal.continue(
      CardinalCommerce.PAYMENT_BRAND,
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
   * @protected
   */
  protected _onCardinalLoad() {
    Cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);
    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.SETUP_COMPLETE, () => {
      this._onCardinalSetupComplete();
    });
    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
      this._onCardinalValidated(data, jwt);
    });

    Cardinal.setup(CardinalCommerce.PAYMENT_EVENTS.INIT, {
      jwt: this._cardinalCommerceJWT
    });
  }

  /**
   * Inserts songbird.js and load script.
   * @private
   */
  protected _threeDSetup() {
    DomMethods.insertScript('head', environment.CARDINAL_COMMERCE.SONGBIRD_URL).addEventListener('load', () => {
      this._onCardinalLoad();
    });
  }

  /**
   * Call all subscription methods.
   * @private
   */
  private _onInit() {
    this._initSubscriptions();
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
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.THREEDQUERY, (data: IThreeDQueryResponse) => {
      this._onThreeDQueryEvent(data);
    });
  }

  /**
   * Call _threeDInitRequest().
   * @private
   */
  private _onLoadControlFrame() {
    this._threeDInitRequest();
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

  /**
   * Perform a THREEDINIT with ST in order to generate the Cardinal songbird JWT
   */
  private _threeDInitRequest() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.THREEDINIT
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   *
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
      type: MessageBus.EVENTS_PUBLIC.AUTH
    };
    if (this._tokenise) {
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.CACHETOKENISE;
    }
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }
}

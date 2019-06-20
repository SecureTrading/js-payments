import { environment } from '../../environments/environment';
import { INotificationEvent, NotificationType } from '../models/NotificationEvent';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';

declare const Cardinal: any;

export interface IThreeDQueryResponse {
  acquirertransactionreference: string;
  acsurl: string;
  enrolled: string;
  threedpayload: string;
  transactionreference: string;
}

/**
 * Cardinal Commerce class:
 * Defines integration with Cardinal Commerce and flow of transaction with this supplier.
 * Configuration steps:
 * 1.Cardinal.setup() + required Merchant JWT
 * 2.Cardinal.on('payments.setupComplete)
 * 3.Add BIN detection to PAN field
 * 4.Perform cmpi_lookup request (defined in STtransport class)
 * 5.Cardinal.continue + required payload from cmpi_lookup response
 * 6.Cardinal.on('pauments.validated) - process auth or return failure
 */
export class CardinalCommerce {
  private static PAYMENT_BRAND: string = 'cca';
  private static PAYMENT_EVENTS = {
    INIT: 'init',
    SETUP_COMPLETE: 'payments.setupComplete',
    VALIDATED: 'payments.validated'
  };
  private static VALIDATION_EVENTS = {
    ERROR: 'ERROR',
    FAILURE: 'FAILURE',
    NOACTION: 'NOACTION',
    SUCCESS: 'SUCCESS'
  };

  public messageBus: MessageBus;
  private _cardinalCommerceJWT: string;
  private _cardinalCommerceCacheToken: string;
  private _threedQueryTransactionReference: string;
  private _startOnLoad: boolean;
  private _jwt: string;
  private _requestTypes: string[];

  constructor(startOnLoad: boolean, jwt: string, requestTypes: string[]) {
    this._startOnLoad = startOnLoad;
    this._jwt = jwt;
    this._requestTypes = requestTypes;
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
  protected _onCardinalValidated(data: any, jwt: any) {
    if (['SUCCESS', 'NOACTION', 'FAILURE'].includes(data.ActionCode)) {
      this._authorizePayment({
        threedresponse: jwt
      });
    } else {
      const responseData: IResponseData = {
        errorcode: '50003',
        errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
      };
      const translator = new Translator(new StJwt(this._jwt).locale);
      responseData.errormessage = translator.translate(responseData.errormessage);
      const notificationEvent: IMessageBusEvent = {
        data: responseData,
        type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
      };
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
    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.VALIDATED, (data: any, jwt: any) => {
      this._onCardinalValidated(data, jwt);
    });
    Cardinal.setup(CardinalCommerce.PAYMENT_EVENTS.INIT, {
      jwt: this._cardinalCommerceJWT
    });
  }

  protected _threeDSetup() {
    DomMethods.insertScript('head', environment.CARDINAL_COMMERCE.SONGBIRD_URL).addEventListener('load', () => {
      this._onCardinalLoad();
    });
  }

  private _onInit() {
    this._initSubscriptions();
    this._publishRequestTypesEvent(this._requestTypes);
  }

  private _initSubscriptions() {
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME, () => {
      this._onLoadControlFrame();
    });
    this.messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.THREEDINIT, (data: any) => {
      this._onThreeDInitEvent(data);
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

  private _onLoadControlFrame() {
    this._threeDInitRequest();
  }

  private _onThreeDInitEvent(data: any) {
    this._cardinalCommerceJWT = data.threedinit;
    this._cardinalCommerceCacheToken = data.cachetoken;
    this._threeDSetup();
  }

  private _onThreeDQueryEvent(data: any) {
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

  private _threeDQueryRequest(responseObject: IThreeDQueryResponse) {
    if (this._isCardEnrolledAndNotFrictionless(responseObject)) {
      this._authenticateCard(responseObject);
    } else {
      this._threedQueryTransactionReference = responseObject.transactionreference;
      this._authorizePayment();
    }
  }

  private _isCardEnrolledAndNotFrictionless(response: IThreeDQueryResponse) {
    return response.enrolled === 'Y' && response.acsurl !== undefined;
  }

  private _authorizePayment(data?: any) {
    data = data || {};
    data.cachetoken = this._cardinalCommerceCacheToken;
    data.parenttransactionreference = this._threedQueryTransactionReference;
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }
}

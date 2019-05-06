import { environment } from '../../environments/environment';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';

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
export default class CardinalCommerce {
  get step(): boolean {
    return this._step;
  }

  set step(value: boolean) {
    this._step = value;
  }

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
  private _step: boolean;

  constructor(step: boolean) {
    this.step = step;
    this._messageBus = new MessageBus();
    this._onInit();
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occurred during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  public _onCardinalSetupComplete() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL
    };
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BIN_PROCESS, (data: IFormFieldState) => {
      Cardinal.trigger('bin.process', data.value);
    });
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Triggered when the transaction has been finished.
   * @protected
   */
  protected _onCardinalValidated(data: any, jwt: any) {
    // @TODO: handle all errors - part of STJS-25
    if (data.ActionCode === 'SUCCESS') {
      this._authorizePayment({
        threedresponse: jwt
      });
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

  private _onInit() {
    this._initSubscriptions();
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

  private _threeDSetup() {
    DomMethods.insertScript('head', environment.CARDINAL_COMMERCE.SONGBIRD_URL).addEventListener('load', () => {
      this._onCardinalLoad();
    });
  }

  private _threeDQueryRequest(responseObject: IThreeDQueryResponse) {
    if (this._isCardEnrolledAndNotFrictionless(responseObject)) {
      this._authenticateCard(responseObject);
    } else {
      this._authorizePayment({
        parenttransactionreference: responseObject.transactionreference
      });
    }
  }

  private _isCardEnrolledAndNotFrictionless(response: IThreeDQueryResponse) {
    return response.enrolled === 'Y' && response.acsurl !== undefined;
  }

  private _authorizePayment(data: any) {
    data.cachetoken = this._cardinalCommerceCacheToken;
    data.parenttransactionreference = this._threedQueryTransactionReference;
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS_PUBLIC.AUTH
    };
    if (this.step) {
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.CACHETOKENISE;
    }
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  // /**
  //  * Retrieves validation data and assign it to class fields
  //  * @param validationData
  //  * @param jwt
  //  * @private
  //  */
  // private _retrieveValidationData(validationData: any, jwt?: string) {
  //   const { ActionCode } = validationData;
  //   const authRequest = { ...this._payload };
  //   if (ActionCode === CardinalCommerce.VALIDATION_EVENTS.SUCCESS) {
  //     Object.defineProperty(authRequest, 'threedresponse', { value: jwt, writable: false });
  //     this._authCallToST(authRequest).then((response: any) => alert(response.errormessage));
  //   } else if (
  //     ActionCode === CardinalCommerce.VALIDATION_EVENTS.FAILURE ||
  //     ActionCode === CardinalCommerce.VALIDATION_EVENTS.NOACTION
  //   ) {
  //     this._authCallToST(authRequest).then((response: any) => alert(response.errormessage));
  //   } else if (ActionCode === CardinalCommerce.VALIDATION_EVENTS.ERROR) {
  //     alert(CardinalCommerce.VALIDATION_EVENTS.ERROR);
  //   }
  //   return { jwt, validationData };
  // }
  //
  // private _authCallToST = (authRequest: any) => this._stTransport.sendRequest(authRequest);
}

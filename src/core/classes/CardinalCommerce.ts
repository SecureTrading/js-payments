declare const Cardinal: any;

import { environment } from '../../environments/environment';
import DomMethods from './../shared/DomMethods';
import Selectors from '../shared/Selectors';

interface ThreeDQueryResponse {
  acquirerresponsemessage: string;
  acsurl: string;
  enrolled: string;
  pareq: string;
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

  private _controlFrame: Window;
  private _controlFrameUrl: string = 'http://localhost:8080'; // @TODO: this should not be hardcoded
  private _cardinalCommerceJWT: string;
  private _cardinalCommerceCacheToken: string;

  constructor(jwt: string) {
    // @ts-ignore
    this._controlFrame = window.frames[Selectors.CONTROL_FRAME_IFRAME_SELECTOR];

    this._onInit();
  }

  private _onInit() {
    // @TODO: use MessageBus
    window.addEventListener('message', (event: MessageEvent) => {
      let messageBusEvent: MessageBusEvent = event.data;

      switch (messageBusEvent.type) {
        case 'LOAD_CONTROL_FRAME':
          this._threeDInitRequest();
          break;
        case 'THREEDINIT':
          this._cardinalCommerceJWT = messageBusEvent.data.jwt;
          this._cardinalCommerceCacheToken = messageBusEvent.data.cachetoken;
          this._threeDSetup();
          break;
        case 'THREEDQUERY':
          this.onThreeDQuery(messageBusEvent.data);
          break;
        default:
          break;
      }
    });
  }

  /**
   * Perform a THREEDINIT with ST in order to generate the Cardinal songbird JWT
   */
  private _threeDInitRequest() {
    this._controlFrame.postMessage({ type: 'THREEDINIT' }, this._controlFrameUrl);
  }

  private _threeDSetup() {
    DomMethods.insertScript('head', environment.SONGBIRD_URL).addEventListener('load', () => {
      this._onCardinalLoad();
    });
  }

  /**
   * Initiate configuration of Cardinal Commerce
   * Initialize Cardinal Commerce mechanism with given JWT (by merchant).
   * @private
   */
  private _onCardinalLoad() {
    Cardinal.configure(environment.CARDINAL_COMMERCE_CONFIG);
    Cardinal.setup(CardinalCommerce.PAYMENT_EVENTS.INIT, {
      jwt: this._cardinalCommerceJWT
    });

    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.SETUP_COMPLETE, () => {
      this._onCardinalSetupComplete();
    });

    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.VALIDATED, (data: any, jwt: any) => {
      this._onCardinalValidated(data, jwt);
    });
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occurred during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  private _onCardinalSetupComplete() {
    // @TODO: use MessageBus
    this._controlFrame.postMessage({ type: 'LOAD_CARDINAL' }, this._controlFrameUrl);
  }

  /**
   * Triggered when the transaction has been finished.
   * @private
   */
  private _onCardinalValidated(data: any, jwt: any) {
    // @TODO: handle all errors - part of STJS-25
    if (data.ActionCode === 'SUCCESS') {
      this._authorizePayment(jwt);
    }
  }

  private onThreeDQuery(responseObject: ThreeDQueryResponse) {
    if (this._isCardEnrolled(responseObject.enrolled)) {
      this._authenticateCard(responseObject);
    } else {
      // @TODO
      // N - Perform an AUTH Request, including the transactionreference returned in the THREEDQUERY response.
      // U - This typically indicates a temporary problem with the card issuer’s systems. You can configure your system to resubmit the same THREEDQUERY request. If this continues to fail, perform a standard AUTH request, including the transactionreference returned in the THREEDQUERY response.
    }
  }

  private _isCardEnrolled(enrolled: string) {
    return enrolled === 'Y';
  }

  /**
   * Handles continue action from Cardinal Commerce, retrieve overlay with iframe which target is on AcsUrl
   * and handles the rest of process.
   * Cardinal.continue(PAYMENT_BRAND, CONTINUE_DATA, ORDER_OBJECT, NEW_JWT)
   * @private
   */
  private _authenticateCard(responseObject: ThreeDQueryResponse) {
    Cardinal.continue(
      CardinalCommerce.PAYMENT_BRAND,
      {
        AcsUrl: responseObject.acsurl,
        Payload: responseObject.pareq // @TODO: this should be threedresponse not pareq but the server needs updating
      },
      {
        Cart: [],
        OrderDetails: { TransactionId: responseObject.acquirerresponsemessage }
      },
      this._cardinalCommerceJWT
    );
  }

  private _authorizePayment(threeDResponse: string) {
    // @TODO: use MessageBus
    this._controlFrame.postMessage({ type: 'AUTH', data: threeDResponse }, this._controlFrameUrl);
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

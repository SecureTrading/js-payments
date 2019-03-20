declare const Cardinal: any;
import { cardinalCommerceConfig } from '../imports/cardinalSettings';
import { IStRequest } from './StCodec.class';
import StTransport from './StTransport.class';
import { IStTransportParams } from './StTransport.class';

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
class CardinalCommerce {
  private static PAYMENT_BRAND: string = 'cca';
  private static PAYMENT_EVENTS = {
    INIT: 'init',
    SETUP_COMPLETE: 'payments.setupComplete',
    VALIDATED: 'payments.validated'
  };
  private static SONGBIRD_URL: string = 'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js';
  private static VALIDATION_EVENTS = {
    ERROR: 'ERROR',
    FAILURE: 'FAILURE',
    NOACTION: 'NOACTION',
    SUCCESS: 'SUCCESS'
  };

  private _cardinalCommerceJWT: string;
  private _cardinalPayload: any;
  private _cart: string[] = [];
  private _payload: IStRequest = {
    accounttypedescription: 'ECOM',
    expirydate: '01/20',
    pan: '4111111111111111',
    requesttypedescription: 'THREEDQUERY',
    sitereference: 'live2',
    securitycode: '123',
    termurl: 'http://something.com'
  };
  private _threedeinitRequestObject: IStRequest = {
    sitereference: 'live2',
    requesttypedescription: 'THREEDINIT'
  };
  private _sessionId: string;
  private _transactionId: string;
  private _stTrasportParams: IStTransportParams = {
    jwt: '',
    gatewayUrl: ''
  };

  public stTransport: any;

  constructor(jwt: string, gatewayUrl: string) {
    this._stTrasportParams = {
      jwt: jwt,
      gatewayUrl: gatewayUrl
    };
    this.stTransport = new StTransport(this._stTrasportParams);
    this._threedeinitRequest().then((response: any) => {
      this._cardinalCommerceJWT = response.jwt;
      this._insertSongbird();
      this._triggerLookupRequest();
    });
  }

  /**
   * Perform a THREEDINIT with ST in order to generate the Cardinal songbird JWT
   */
  private _threedeinitRequest = () => this.stTransport.sendRequest(this._threedeinitRequestObject);

  private _authCallToST = (authRequest: any) => this.stTransport.sendRequest(authRequest);

  /**
   * Add Cardinal Commerce Songbird.js library to merchants page.
   * When library is loaded then it triggers configuration of Cardinal Commerce
   * @private
   */
  private _insertSongbird() {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    head.appendChild(script);
    script.addEventListener('load', () => this._setConfiguration());
    script.src = CardinalCommerce.SONGBIRD_URL;
    return script;
  }

  /**
   * Initiate configuration of Cardinal Commerce
   * @private
   */
  private _setConfiguration() {
    Cardinal.configure(cardinalCommerceConfig);
    this._onSetup();
    this._onPaymentValidation();
    this._onPaymentSetupComplete();
  }

  /**
   * Listens to submit event, send request to ST and handle response
   * @private
   */
  private _triggerLookupRequest() {
    window.addEventListener('submit', event => {
      event.preventDefault();
      this.stTransport.sendRequest(this._payload).then((response: any) => {
        this._cardinalPayload = {
          AcsUrl: response.acsurl,
          Payload: response.pareq // TODO this should be threedresponse not pareq but the server needs updating
        };
        this._transactionId = response.acquirerresponsemessage;
        this._onContinue();
      });
    });
  }

  /**
   * Retrieves validation data and assign it to class fields
   * @param validationData
   * @param jwt
   * @private
   */
  private _retrieveValidationData(validationData: any, jwt?: string) {
    const { ActionCode } = validationData;
    const authRequest = { ...this._payload };
    if (ActionCode === CardinalCommerce.VALIDATION_EVENTS.SUCCESS) {
      Object.defineProperty(authRequest, 'threedresponse', { value: jwt, writable: false });
      this._authCallToST(authRequest).then((response: any) => alert(response.errormessage));
    } else if (
      ActionCode === CardinalCommerce.VALIDATION_EVENTS.FAILURE ||
      ActionCode === CardinalCommerce.VALIDATION_EVENTS.NOACTION
    ) {
      this._authCallToST(authRequest).then((response: any) => alert(response.errormessage));
    } else if (ActionCode === CardinalCommerce.VALIDATION_EVENTS.ERROR) {
      alert(CardinalCommerce.VALIDATION_EVENTS.ERROR);
    }
    return { jwt, validationData };
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occurred during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  private _onPaymentSetupComplete() {
    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.SETUP_COMPLETE, (setupCompleteData: any) => {
      this._sessionId = setupCompleteData.sessionId;
      return setupCompleteData.sessionId;
    });
  }

  /**
   * Triggered when the transaction has been finished.
   * @private
   */
  private _onPaymentValidation() {
    Cardinal.on(CardinalCommerce.PAYMENT_EVENTS.VALIDATED, (data: any, jwt?: string) =>
      this._retrieveValidationData(data, jwt)
    );
  }

  /**
   * Initialize Cardinal Commerce mechanism with given JWT (by merchant).
   * @private
   */
  private _onSetup() {
    Cardinal.setup(CardinalCommerce.PAYMENT_EVENTS.INIT, {
      jwt: this._cardinalCommerceJWT
    });
  }

  /**
   * Handles continue action from Cardinal Commerce, retrieve overlay with iframe which target is on AcsUrl
   * and handles the rest of process.
   * Cardinal.continue(PAYMENT_BRAND, CONTINUE_DATA, ORDER_OBJECT, NEW_JWT)
   * @private
   */
  private _onContinue() {
    Cardinal.continue(
      CardinalCommerce.PAYMENT_BRAND,
      this._cardinalPayload,
      {
        Cart: this._cart,
        OrderDetails: { TransactionId: this._transactionId }
      },
      this._cardinalCommerceJWT
    );
  }
}

export default CardinalCommerce;

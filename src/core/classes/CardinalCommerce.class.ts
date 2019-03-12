declare const Cardinal: any;
import { cardinalCommerceConfig } from '../imports/cardinalSettings';
import StTransport from './StTransport.class';
import { IStRequest } from './StCodec.class';

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
class CardinalCommerce extends StTransport {
  private static PAYMENT_EVENTS = {
    INIT: 'init',
    SETUP_COMPLETE: 'payments.setupComplete',
    VALIDATED: 'payments.validated'
  };

  private static SONGBIRD_URL =
    'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js';

  private static VALIDATION_EVENTS = {
    ERROR: 'ERROR',
    FAILURE: 'FAILURE',
    NOACTION: 'NOACTION',
    SUCCESS: 'SUCCESS'
  };

  private _cardinalCommerceJWT: string;
  private _payload: IStRequest;
  private _merchantJWT: string = (document.getElementById(
    'JWTContainer'
  ) as HTMLInputElement).value;
  private _sessionId: string;
  private _orderDetails: object = {
    OrderDetails: {
      Cart: ['Detail one', 'Detail two'],
      TransactionId: this._sessionId ? this._sessionId : ''
    }
  };
  private _paymentBrand: string = 'cca';
  private _validationData: any;

  set payload(value: IStRequest) {
    this._payload = value;
  }

  constructor(jwt: string, gatewayUrl: string) {
    super({ jwt, gatewayUrl });
    this._insertSongbird();
    this.threedeinitRequest();
    this.payload = {
      accounttypedescription: 'ECOM',
      expirydate: '01/20',
      pan: '4111111111111111',
      requesttypedescription: 'AUTH',
      sitereference: 'test_james38641',
      securitycode: '123'
    };
    this._triggerLookupRequest();
  }

  /**
   * This is temporary function for generating Merchant JWT
   * TODO: delete after development
   */
  public threedeinitRequest() {
    const jwtGenerator = document.getElementById('threedequery');
    jwtGenerator.addEventListener('click', () => {
      fetch(CardinalCommerce.GATEWAY_URL, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          request: [
            {
              sitereference: 'live2', // This will eventually come from the merchant config
              currencyiso3a: 'GBP', // ISO currency code of the payment
              baseamount: '1000', // amount of the payment
              accounttypedescription: 'ECOM', // Don't worry about this field for now
              requesttypedescription: 'THREEDINIT' // for other requests this could be THREEDINIT, CACHETOKENISE or AUTH
            }
          ],
          version: '1.00'
        })
      })
        .then(response => {
          return response.json();
        })
        .then(response => {
          console.log(response.response[0].jwt);
        });
    });
  }

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
      this.sendRequest(this._payload).then(response => {
        console.log(response);
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
  private _retrieveValidationData(validationData: string, jwt?: string) {
    this._validationData = validationData;
    this._cardinalCommerceJWT = jwt ? jwt : this._merchantJWT;
    console.log(validationData);
    console.log(this._merchantJWT);
    return { jwt, validationData };
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occurred during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  private _onPaymentSetupComplete() {
    Cardinal.on(
      CardinalCommerce.PAYMENT_EVENTS.SETUP_COMPLETE,
      (setupCompleteData: any) => {
        this._sessionId = setupCompleteData.sessionId;
        console.log(`Session ID is: ${this._sessionId}`);
        return setupCompleteData.sessionId;
      }
    );
  }

  /**
   * Triggered when the transaction has been finished.
   * @private
   */
  private _onPaymentValidation() {
    Cardinal.on(
      CardinalCommerce.PAYMENT_EVENTS.VALIDATED,
      (data: any, jwt: string) => {
        switch (data.ActionCode) {
          case CardinalCommerce.VALIDATION_EVENTS.SUCCESS:
            this._retrieveValidationData(data, jwt);
            break;
          case CardinalCommerce.VALIDATION_EVENTS.NOACTION:
            this._retrieveValidationData(data);
            break;
          case CardinalCommerce.VALIDATION_EVENTS.FAILURE:
            this._retrieveValidationData(data);
            break;
          case CardinalCommerce.VALIDATION_EVENTS.ERROR:
            this._retrieveValidationData(data);
            break;
        }
      }
    );
  }

  /**
   * Initialize Cardinal Commerce mechanism with given JWT (by merchant).
   * @private
   */
  private _onSetup() {
    Cardinal.setup(CardinalCommerce.PAYMENT_EVENTS.INIT, {
      jwt: this._merchantJWT
    });
  }

  /**
   * Handles continue action from Cardinal Commerce, retrieve overlay with iframe which target is on AcsUrl
   * and handles the rest of process.
   * @private
   */
  private _onContinue() {
    Cardinal.continue(
      this._paymentBrand,
      this._payload,
      this._orderDetails,
      this._merchantJWT
    );
  }
}

export default CardinalCommerce;

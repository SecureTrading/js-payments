declare const Cardinal: any;
import {
  applePayConfig,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
} from '../imports/cardinalSettings';
import StTransport from './StTransport.class';
import { IStRequest } from './StCodec.class';

/**
 * Cardinal Commerce class:
 * Defines integration with Cardinal Commerce and flow of transaction with this supplier.
 */
class CardinalCommerce extends StTransport {
  private static SONGBIRD_URL =
    'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js';
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

  /**
   * Add Cardinal Commerce Songbird.js library to merchants page
   * @private
   */
  private _insertCardinalCommerceSongbird() {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    head.appendChild(script);
    script.addEventListener('load', () => {
      CardinalCommerce._setConfiguration();
      this._onPaymentSetupComplete();
      this._onPaymentValidation();
      this._onSetup();
    });
    script.src = CardinalCommerce.SONGBIRD_URL;
  }

  /**
   * Method for passing configuration object
   * @private
   */
  private static _setConfiguration() {
    Cardinal.configure({
      applePayConfig,
      loggingConfiguration,
      paymentConfig,
      paypalConfig,
      visaCheckoutConfig
    });
  }

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
    this._insertCardinalCommerceSongbird();
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
      }
    );
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
      });
    });
  }

  /**
   * Triggered when the transaction has been finished.
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
}

export default CardinalCommerce;

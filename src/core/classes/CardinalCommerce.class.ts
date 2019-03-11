declare const Cardinal: any;
import {
  applePayConfig,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
} from '../imports/cardinalSettings';

/**
 * Cardinal Commerce class:
 * Defines integration with Cardinal Commerce and flow of transaction with this supplier.
 */
class CardinalCommerce {
  private static WEBSERVICE_URL: string =
    'https://webservices.securetrading.net/public/json/';
  private static FETCH_CONFIG: object = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  };
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

  private _insertCardinalCommerceSongbird() {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    head.appendChild(script);
    script.src =
      'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js';
    script.addEventListener('load', () => {
      CardinalCommerce._setConfiguration();
    });
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

  private _jwt: string = (document.getElementById(
    'JWTContainer'
  ) as HTMLInputElement).value;
  private _jwtChanged: string;
  private _validationData: any;
  private _sessionId: string;
  private _orderDetails: object = {
    OrderDetails: {
      Cart: ['Detail one', 'Detail two'],
      TransactionId: this._sessionId ? this._sessionId : ''
    }
  };
  private _paymentBrand: string = 'cca';

  constructor() {
    this._insertCardinalCommerceSongbird();
    this._onPaymentSetupComplete();
    this._onPaymentValidation();
    this._onSetup();
    window.addEventListener('submit', event => {
      event.preventDefault();
      this._onContinue();
    });
    document
      .getElementById('threedequery')
      .addEventListener('click', response => {
        this.threedeinitRequest();
      });
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
      }
    );
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
      jwt: this._jwt
    });
  }

  /**
   * On submit action, this method will have been mocked till the backend in ST Webservice will be finished
   * @private
   */
  private _onSubmit() {
    fetch(CardinalCommerce.WEBSERVICE_URL, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        jwt: this._jwt,
        request: [
          {
            sitereference: 'live2', // This will eventually come from the merchant config
            requesttypedescription: 'THREEDQUERY', // for other requests this could be THREEDINIT, CACHETOKENISE or AUTH
            pan: '4111111111111111', // this is cardNumber
            expirydate: '12/20',
            securitycode: '123'
            // Any other fields you're submitting would go in here too
          }
        ],
        version: '1.00'
      })
    })
      .then(response => {
        return response.json();
      })
      .then(response => {
        console.log(response);
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
      this._onSubmit(),
      this._orderDetails,
      this._jwtChanged
    );
  }

  /**
   * Retrieves validation data and assign it to class fields
   * @param validationData
   * @param jwt
   * @private
   */
  private _retrieveValidationData(validationData: string, jwt?: string) {
    this._validationData = validationData;
    this._jwtChanged = jwt ? jwt : this._jwt;
    console.log(validationData);
    console.log(this._jwt);
  }

  /**
   * Gather all the information needed to be posted
   * @private
   */
  private _collectDataToPost() {
    return {
      cardNumber: localStorage.getItem('cardNumberValue'),
      expirationDate: localStorage.getItem('expirationDateValue'),
      securityCode: localStorage.getItem('securityCode')
    };
  }

  public threedeinitRequest() {
    fetch('https://webservices.securetrading.net/public/json/', {
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
        console.log(response);
      });
  }
}

export default CardinalCommerce;

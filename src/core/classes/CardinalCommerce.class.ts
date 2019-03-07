import Cardinal from '../imports/cardinalLibrary';
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
    CardinalCommerce._setConfiguration();
    this._onPaymentSetupComplete();
    this._onPaymentValidation();
    this._onSetup();
    window.addEventListener('submit', event => {
      event.preventDefault();
      this._onContinue();
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
    fetch('https://webservices.securetrading.net/public/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cardNumber: 111111111111,
        expirationDate: '12/20',
        securityCode: 1111
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
}

export default CardinalCommerce;

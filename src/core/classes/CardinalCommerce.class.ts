import Cardinal from '../imports/cardinalLibrary';
import {
  applePayConfig,
  loggingConfiguration,
  mockDataFromBackend,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
} from '../imports/cardinalSettings';

class CardinalCommerce {
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
  private _jwt: string;
  private _jwtChanged: string;
  private _validationData: any;
  private _sessionId: string;
  private _orderDetails: object = {
    OrderDetails: {
      Cart: ['Detail one', 'Detail two'],
      TransactionId: this._sessionId ? this._sessionId : ''
    }
  };

  constructor() {
    this._getJwt();
    CardinalCommerce._setConfiguration();
    this._onPaymentSetupComplete();
    this._onPaymentValidation();
    this._onSetup();
    window.addEventListener('submit', () => {
      this._onContinue();
    });
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occured during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  private _onPaymentSetupComplete() {
    Cardinal.on('payments.setupComplete', (setupCompleteData: any) => {
      this._sessionId = setupCompleteData.sessionId;
    });
  }

  /**
   * Triggered when the transaction has been finished.
   */
  private _onPaymentValidation() {
    Cardinal.on('payments.validated', (data: any, jwt: string) => {
      switch (data.ActionCode) {
        case 'SUCCESS':
          // Handle successful transaction, send JWT to backend to verify
          this._retrieveValidationData(data, jwt);
          break;

        case 'NOACTION':
          this._retrieveValidationData(data);
          break;

        case 'FAILURE':
          this._retrieveValidationData(data);
          break;

        case 'ERROR':
          this._retrieveValidationData(data);
          break;
      }
    });
  }

  /**
   * Initialize Cardinal Commerce mechanism with given JWT (by merchant).
   * @private
   */
  private _onSetup() {
    Cardinal.setup('init', {
      jwt: this._jwt
    });
  }

  /**
   * On submit action, this method will have been mocked till the backend in ST Webservice will be finished
   * @private
   */
  private _onSubmit() {
    return mockDataFromBackend;
  }

  /**
   * Handles continue action from Cardinal Commerce, retrieve overlay with iframe which target is on AcsUrl
   * and handles the rest of process.
   * @private
   */
  private _onContinue() {
    Cardinal.continue(
      'cca',
      this._onSubmit(),
      this._orderDetails,
      this._jwtChanged
    );
  }

  /**
   * Retrieves jwt from hidden input
   * @private
   */
  private _getJwt() {
    this._jwt = (document.getElementById(
      'JWTContainer'
    ) as HTMLInputElement).value;
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
    console.log(this._validationData);
  }
}

export default CardinalCommerce;

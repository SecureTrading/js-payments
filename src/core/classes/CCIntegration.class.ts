import Cardinal from '../imports/cardinalLibrary';
import {
  applePayConfig,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
} from '../imports/cardinalSettings';

class CCIntegration {
  constructor() {
    CCIntegration._setConfiguration();
    CCIntegration._onPaymentSetupComplete();
    CCIntegration._onPaymentValidation();
    CCIntegration._onSetup();
  }

  /**
   * Method for passing configuration object
   */
  private static _setConfiguration() {
    Cardinal.configure({
      loggingConfiguration,
      paymentConfig,
      applePayConfig,
      paypalConfig,
      visaCheckoutConfig
    });
  }

  /**
   * Method on successful initialization after calling Cardinal.setup() - Songbird.js has been successfully initialized.
   * CAUTION ! this will not be triggered if an error occured during Cardinal.setup() call.
   * This includes a failed JWT authentication.
   */
  private static _onPaymentSetupComplete() {
    Cardinal.on('payments.setupComplete', (setupCompleteData: any) => {
      //
    });
  }

  /**
   * Triggered when the transaction has been finished.
   */
  private static _onPaymentValidation() {
    Cardinal.on('payments.validated', (data: any, jwt: any) => {
      switch (data.ActionCode) {
        case 'SUCCESS':
          console.log('SUCCESS');
          // Handle successful transaction, send JWT to backend to verify
          break;

        case 'NOACTION':
          console.log('NOACTION');
          // Handle no actionable outcome
          break;

        case 'FAILURE':
          console.log('FAILURE');
          // Handle failed transaction attempt
          break;

        case 'ERROR':
          console.log('ERROR');
          break;
      }
    });
  }

  /**
   * Setup method with given JWT passed from backend
   */
  private static _onSetup() {
    Cardinal.setup('init', {
      jwt: (document.getElementById('JWTContainer') as HTMLInputElement).value
    });
  }
}

export default CCIntegration;

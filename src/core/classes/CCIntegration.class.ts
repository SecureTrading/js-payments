import Cardinal from '../imports/cardinalLibrary';
import {
  applePayConfig,
  jwt,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
} from '../imports/cardinalSettings';

class CCIntegration {
  private static _jwtStringified: string = JSON.stringify(jwt);

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
   * Method on successful initialization after calling Cardinal.setup()
   */
  private static _onPaymentSetupComplete() {
    Cardinal.on('payments.setupComplete', function(setupCompleteData: any) {
      console.log('fdsfsdfsdfsdfsdfs');
    });
  }

  private static _onPaymentValidation() {
    Cardinal.on('payments.validated', (data: any, jwt: any) => {
      switch (data.ActionCode) {
        case 'SUCCESS':
          console.log('Success');
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
          // Handle service level error
          break;
      }
    });
  }

  /**
   * Setup method with given JWT passed from backend
   */
  private static _onSetup() {
    Cardinal.setup('init', {
      jwt: jwt
    });
  }
}

export default CCIntegration;

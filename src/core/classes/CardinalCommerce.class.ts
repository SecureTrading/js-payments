import Cardinal from '../imports/cardinalLibrary';
import {
  applePayConfig,
  loggingConfiguration,
  paymentConfig,
  paypalConfig,
  visaCheckoutConfig
} from '../imports/cardinalSettings';

const mockDataFromBackend = {};

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
      console.log(setupCompleteData);
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
          console.log(data);
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

  /**
   * CMPI Lookup request
   */
  private _onSubmit() {
    return;
  }

  private _onContinue() {
    Cardinal.continue(
      'cca',
      {
        AcsUrl:
          'https://testcustomer34.cardinalcommerce.com/merchantacsfrontend/pareq.jsp?vaa=b&gold=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        Payload:
          'eNpVUU1zgjAQvedXOE7PJHxKnTUzVNvRqVK1eGhvTEwLo4AmINpf3wSh2tu+3X3Je28hSgTnk3fOKsEpLLiU8TfvpdtR/ysMWfBK5kVg74NpvZj5Y9KnsAzW/EjhxIVMi5yaBjEswB1E6gnBkjgvKcTs+DQLqWnZjusNfMBtA0HGxWxyN7hiBHmccRoVF7muJOAGIWBFlZfiQn2HAO4AgkrsaVKWBznEuK5ro1Q0UUmDFRkGrKcI8E3MstKVVB7P6ZZ+7ty3D/IyXzyfT6solKtNYkebnbP6CUaA9QaCbVxyahHTIx4xe6Y/dK2h4wBu+gjiTEuhD6ZrECWshQgO+qPgikxXj+47yk4lBM9Z56dDCPj5UORc7ag4/2rl4aZ8PNWhslJl9ThwPNfUkTawYacqF4sQu6GnTUhYU3B7MtxeV1X/rv4LkFCmLA=='
      },
      {
        OrderDetails: {
          TransactionId: 'O9J65gievSH6CYPJCuB0'
        }
      }
    );
  }
}

export default CCIntegration;

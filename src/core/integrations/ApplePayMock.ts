import { environment } from '../../environments/environment';
import { applePayButton } from '../imports/images';
import { NotificationType } from '../models/NotificationEvent';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import ApplePay from './ApplePay';

class ApplePaySessionMock {
  public static onvalidatemerchant: any;
  public static onpaymentauthorized: any;
  public static completePayment: any;
  public static oncancel: any;

  public static completeMerchantValidation() {}

  public static completePaymentMethodSelection() {}

  /**
   * Retrieves Apple Pay data from test endpoint
   * @private
   */
  public static begin() {
    return fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        return data;
      });
  }
}

/**
 * Mocked version of Apple Pay setting test environment for Apple Pay automated tests.
 */
class ApplePayMock extends ApplePay {
  public ifApplePayIsAvailable = () => true;

  public setApplePayVersion() {
    this.applePayVersion = 5;
  }

  public checkApplePayAvailability = () => true;

  public checkApplePayWalletCardAvailability = () => true;

  public getApplePaySessionObject = () => ApplePaySessionMock;

  public paymentDetails: string;

  constructor(config: any, step: boolean, jwt: string) {
    super(config, step, jwt);
  }
}

export default ApplePayMock;

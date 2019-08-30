import DomMethods from '../shared/DomMethods';
import ApplePay from './ApplePay';
import ApplePaySessionMock from './ApplePaySessionMock';
const applePayButton: string = '../../../images/apple-pay.png';
/**
 * Mocked version of Apple Pay setting test environment for Apple Pay automated tests.
 */
class ApplePayMock extends ApplePay {
  public paymentDetails: string;

  public ifApplePayIsAvailable() {
    return true;
  }

  public setApplePayVersion() {
    this.applePayVersion = 5;
  }

  public checkApplePayAvailability() {
    return true;
  }

  public checkApplePayWalletCardAvailability() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public getApplePaySessionObject() {
    return ApplePaySessionMock;
  }

  public getPaymentSuccessStatus() {
    return ApplePaySessionMock.STATUS_SUCCESS;
  }

  public getPaymentFailureStatus() {
    return ApplePaySessionMock.STATUS_FAILURE;
  }

  /**
   * Creates Apple Pay button element created from base64 image
   * @public
   */
  public createApplePayButton() {
    return DomMethods.createHtmlElement.apply(this, [{ src: applePayButton, id: 'st-apple-pay' }, 'img']);
  }
}

export default ApplePayMock;

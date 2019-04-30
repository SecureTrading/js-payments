import { environment } from '../../environments/environment';
import ApplePay from '../integrations/ApplePay';
import ApplePayMock from '../integrations/ApplePayMock';
import VisaCheckout from '../integrations/VisaCheckout';
import VisaCheckoutMock from '../integrations/VisaCheckoutMock';

/**
 * Sets Alternative Payment Methods available in Secure Trading and defined by merchant
 */
class Wallet {
  private jwt: string;
  private step: boolean;
  private wallets: any;

  constructor(jwt: string, step: boolean, wallets: any) {
    this.jwt = jwt;
    this.step = step;
    this.wallets = wallets;
    this._initWallets(jwt);
  }

  /**
   * Gets wallet config according to given walletName
   * @param walletName - name of payment
   * @private
   */
  private _getWalletConfig(walletName: string) {
    return Object.values(this.wallets).find((item: { name: string }) => item.name === walletName);
  }

  /**
   * Initialize all Alternative Payment Methods defined by merchant and available in ST library
   * @param jwt
   * @private
   */
  private _initWallets(jwt: string) {
    const applePayConfig = this._getWalletConfig(environment.APM_NAMES.APPLE_PAY);
    const visaCheckoutConfig = this._getWalletConfig(environment.APM_NAMES.VISA_CHECKOUT);

    if (applePayConfig) {
      environment.testEnvironment
        ? new ApplePayMock(applePayConfig, this.step, jwt)
        : new ApplePay(applePayConfig, this.step, jwt);
    }
    if (visaCheckoutConfig) {
      environment.testEnvironment
        ? new VisaCheckoutMock(visaCheckoutConfig, this.step, jwt)
        : new VisaCheckout(visaCheckoutConfig, this.step, jwt);
    }
  }
}

export default Wallet;

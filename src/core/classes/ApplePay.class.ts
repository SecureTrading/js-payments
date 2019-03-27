import { StJwt } from '../shared/StJwt';
import Language from './../shared/Language';

const ApplePaySession = (window as any).ApplePaySession;

/**
 * Sets Apple pay APM
 * Apple Pay flow:
 * 1. Checks if ApplePaySession class exists.
 * 2. Call canMakePayments() method to verify the device is capable of making Apple Pay payments.
 * 3. Call canMakePaymentsWithActiveCard(merchantID) to check if there is at least one card in Wallet.
 * 4. Display Apple Pay button.
 * 5. Construct ApplePaySession with versionNumber and ApplePayPaymentRequest as arguments.
 * 6. Call begin() method to display the payment sheet to the customer and initiate the merchant validation process.
 * 7. In onvalidatemerchant handler catch object to pass to completeMerchantValidation
 */
class ApplePay {
  set config(value: any) {
    this._config = value;
  }

  set jwt(value: string) {
    this._jwt = value;
  }

  private _applePayVersionNumber: number = 3;
  private _config: any;
  private _jwt: string;

  constructor(config: any, jwt: string) {
    this.config = config;
    this.jwt = jwt;
    const stJwt = new StJwt(jwt);
    this.config.paymentRequest.total.amount = stJwt.mainamount;
    this.config.paymentRequest.currencyCode = stJwt.currencyiso3a;
    this.initAppleFlow();
  }

  /**
   * Checks whether ApplePay is available on current device
   */
  public checkApplePayAvailability = () => ApplePaySession && ApplePaySession.canMakePayments();

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  public checkApplePayWalletCardAvailability = () => {
    if (this._config.merchantId) {
      return ApplePaySession.canMakePaymentsWithActiveCard(this._config.merchantId);
    }
  };

  /**
   * Sets Apple Pay button and begins Apple Pay flow
   */
  public initAppleFlow() {
    if (this.checkApplePayAvailability()) {
      this.checkApplePayWalletCardAvailability().then((canMakePayments: boolean) => {
        if (canMakePayments) {
          this.paymentSetup();
        } else {
          return Language.translations.APPLE_PAY_NOT_AVAILABLE;
        }
      });
    } else {
      return Language.translations.APPLE_PAY_NOT_AVAILABLE;
    }
  }

  /**
   * Defines Apple Pay session details and begins payment flow.
   */
  public paymentSetup() {
    const session = new ApplePaySession(this._applePayVersionNumber, this._config);
    session.begin();
    session.onvalidatemerchant = (event: any) => {
      console.log(event);
      return event;
    };
  }
}

export default ApplePay;

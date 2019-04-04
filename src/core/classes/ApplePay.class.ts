import { StJwt } from '../shared/StJwt';
import StTransport from './StTransport.class';
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

  get config(): any {
    return this._config;
  }

  set jwt(value: string) {
    this._jwt = value;
  }

  public static APPLE_PAY_VERSION_NUMBER: number = 3;
  private _config: any;
  private _jwt: string;

  constructor(config: any, jwt: string) {
    this.config = config;
    this.jwt = jwt;
    this.setAmountAndCurrency(jwt);
    this.applePayFlow();
  }

  /**
   *
   */
  public setAmountAndCurrency(jwt: string) {
    if (this.config.props.paymentRequest.total.amount && this.config.props.paymentRequest.currencyCode) {
      const stJwtInstance = new StJwt(jwt);
      this.config.props.paymentRequest.total.amount = stJwtInstance.mainamount;
      this.config.props.paymentRequest.currencyCode = stJwtInstance.currencyiso3a;
    }
    return this.config;
  }

  public ifBrowserSupportsApplePayVersion = (version: number) => ApplePaySession.supportsVersion(version);

  /**
   * Checks whether ApplePay is available on current device
   */
  public checkApplePayAvailability = () => ApplePaySession && ApplePaySession.canMakePayments();

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  public checkApplePayWalletCardAvailability = () => {
    if (this.config.props.merchantId) {
      return ApplePaySession.canMakePaymentsWithActiveCard(this.config.props.merchantId);
    }
  };

  public applePayButtonClickHandler = (elementId: string, event: string) => {
    document.getElementById(elementId).addEventListener(event, () => {
      this.paymentSetup();
    });
  };

  /**
   * Sets Apple Pay button and begins Apple Pay flow
   */
  public applePayFlow() {
    if (this.checkApplePayAvailability()) {
      this.checkApplePayWalletCardAvailability().then((canMakePayments: boolean) => {
        if (canMakePayments) {
          this.applePayButtonClickHandler('st-apple-pay', 'click');
        } else {
          if (ApplePaySession.openPaymentSetup) {
            ApplePaySession.openPaymentSetup(this.config.merchantId)
              .then((success: any) => {
                if (success) {
                  alert(success);
                } else {
                  alert('Failed');
                }
              })
              .catch(function(e: any) {
                // Open payment setup error handling
              });
          }
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
    const { paymentRequest } = this.config.props;
    const session = new ApplePaySession(ApplePay.APPLE_PAY_VERSION_NUMBER, paymentRequest);
    session.begin();
    // when the payment sheet is displayed
    session.onvalidatemerchant = (event: any) => {
      console.log(event);
      const URL = event.validationURL;
      return event;
    };
  }
}

export default ApplePay;

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
 * 8. Handle customer's selections in the payment sheet to complete transaction cost - event handlers: onpaymentmethodselected, onshippingmethodselected, and onshippingcontactselected.
 * 9. 30 seconds to handle each event before the payment sheet times out: completePaymentMethodSelection, completeShippingMethodSelection, and completeShippingContactSelection
 */
class ApplePay {
  set jwt(value: string) {
    this._jwt = value;
  }

  get jwt(): string {
    return this._jwt;
  }

  public static APPLE_PAY_VERSION_NUMBER: number = 3;
  public paymentRequest: any;
  public merchantId: string;
  public sitereference: string;
  public sitesecurity: string;
  private _jwt: string;
  private _validateMerchantOptions = {
    url: 'endpointURL',
    cert: 'merchIdentityCert',
    key: 'merchIdentityCert',
    method: 'post',
    body: {
      merchantIdentifier: '',
      displayName: 'MyStore',
      initiative: 'web',
      initiativeContext: 'mystore.example.com'
    },
    json: true
  };

  constructor(config: any, jwt: string) {
    this.paymentRequest = config.props.paymentRequest;
    this.merchantId = config.merchantId;
    this.sitereference = config.sitereference;
    this.sitesecurity = config.sitesecurity;
    this.jwt = jwt;
    this._validateMerchantOptions.body.merchantIdentifier = this.merchantId;
    this.setAmountAndCurrency(jwt);
    this.applePayFlow();
  }

  /**
   *
   */
  public setAmountAndCurrency(jwt: string) {
    if (this.paymentRequest.total.amount && this.paymentRequest.currencyCode) {
      const stJwtInstance = new StJwt(jwt);
      this.paymentRequest.total.amount = stJwtInstance.mainamount;
      this.paymentRequest.currencyCode = stJwtInstance.currencyiso3a;
    }
    return this.paymentRequest;
  }

  public ifBrowserSupportsApplePayVersion = (version: number) => ApplePaySession.supportsVersion(version);

  /**
   * Checks whether ApplePay is available on current device
   */
  public checkApplePayAvailability = () => ApplePaySession && ApplePaySession.canMakePayments();

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  public checkApplePayWalletCardAvailability = () => ApplePaySession.canMakePaymentsWithActiveCard(this.merchantId);

  /**
   *
   * @param elementId
   * @param event
   */
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
    const session = this.getApplePaySessionObject();
    session.begin();
    this.validateMerchantHandler(session);
    this.subscribeStatusHandlers(session);
  }

  /**
   * Function requesting merchant session object
   * @param url
   * @param options
   * @return Merchant session object as JSON
   */
  public static fetchMerchantSession(url: string, options: {}) {
    return fetch(url, options).then((MerchantSession: any) => {
      return MerchantSession.json();
    });
  }

  public getApplePaySessionObject = () => new ApplePaySession(ApplePay.APPLE_PAY_VERSION_NUMBER, this.paymentRequest);

  public validateMerchantHandler(session: any) {
    session.onvalidatemerchant = (event: any) => {
      ApplePay.fetchMerchantSession(event.validationURL, this._validateMerchantOptions)
        .then((response: any) => {
          alert(response);
          ApplePaySession.completeMerchantValidation(response);
          return response;
        })
        .catch(error => alert(`Catched an error: ${error}`));
    };
  }

  public subscribeStatusHandlers(session: any) {
    session.onpaymentmethodselected = (event: any) => {
      const { paymentMethod } = event;
      ApplePaySession.completePaymentMethodSelection(null);
    };

    session.onshippingmethodselected = (event: any) => {
      const { shippingMethod } = event;
      ApplePaySession.completeShippingMethodSelection(null);
    };

    session.onshippingcontactselected = (event: any) => {
      const { shippingContact } = event;
      ApplePaySession.completeShippingContactSelection(null);
    };
  }
}

export default ApplePay;

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
  private _applePayVersionNumber: number = 3;
  private _merchantIdentifier: string;
  private _paymentRequestData: any = {
    countryCode: 'US',
    currencyCode: 'USD',
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    merchantCapabilities: ['supports3DS'],
    total: { label: 'Your Merchant Name', amount: '10.00' }
  };

  constructor(merchantIdentifier: string) {
    this._merchantIdentifier = merchantIdentifier;
    this.setUpApplePayProcess();
  }

  /**
   * Checks whether ApplePay is available on current device
   */
  public checkApplePayAvailability = () =>
    ApplePaySession && ApplePaySession.canMakePayments();

  /**
   * Checks whether ApplePay is available on current device and also if it us at least one active card in Wallet
   */
  public checkApplePayWalletCardAvailability = () =>
    ApplePaySession.canMakePaymentsWithActiveCard(this._merchantIdentifier);

  /**
   * Sets Apple Pay button and begins Apple Pay flow
   */
  public setUpApplePayProcess() {
    if (this.checkApplePayAvailability()) {
      this.checkApplePayWalletCardAvailability().then(
        (canMakePayments: boolean) => {
          if (canMakePayments) {
            this.paymentSetup();
          } else {
            return 'Apple payment is not available';
          }
        }
      );
    } else {
      return 'Apple payment is not available';
    }
  }

  /**
   * Defines Apple Pay session details and begins payment flow.
   */
  public paymentSetup() {
    const session = new ApplePaySession(
      this._applePayVersionNumber,
      this._paymentRequestData
    );
    session.begin();
    session.onvalidatemerchant = (event: any) => {
      console.log(event);
      return event;
    };
  }
}

export default ApplePay;

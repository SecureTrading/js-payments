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
    this.setUpApplePayButton();
  }

  /**
   * Checks whether ApplePay is available on current device
   * canMakePayments() - check ONLY if page supports Apple payments
   */
  public checkApplePayAvailability = () =>
    ApplePaySession && ApplePaySession.canMakePayments();

  /**
   * canMakePaymentsWithActiveCard() - checks same as canMakePayments,but checks also if it us at least one active card in Wallet
   */
  public setUpApplePayButton() {
    if (this.checkApplePayAvailability()) {
      const promise = ApplePaySession.canMakePaymentsWithActiveCard(
        this._merchantIdentifier
      );
      promise.then((canMakePayments: any) => {
        if (canMakePayments) {
        } else {
          // Check for the existence of the openPaymentSetup method.
          if (ApplePaySession.openPaymentSetup) {
            // Display the Set up Apple Pay Button here…
            this.paymentSetup();
          }
        }
      });
    } else {
      console.log('Nope');
    }
  }

  public paymentSetup() {
    ApplePaySession.openPaymentSetup(this._merchantIdentifier)
      .then((success: any) => {
        if (success) {
          const session = new ApplePaySession(
            this._applePayVersionNumber,
            this._paymentRequestData
          );
          session.begin();
          session.onvalidatemerchant = function(event) {
            console.log(event);
          };
          console.log(success);
        } else {
          // setup failed
          console.log('Setup failed');
        }
      })
      .catch((e: any) => {
        // Open payment setup error handling
        console.log(`Setup failed ${e}`);
      });
  }
}

export default ApplePay;

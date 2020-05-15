export interface IApplePay {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: {
    countryCode: string;
    currencyCode: string;
    merchantCapabilities: string[];
    supportedNetworks: string[];
    requestTypes?: string[];
    requiredBillingContactFields: string[];
    requiredShippingContactFields: string[];
    total: {
      label: string;
      amount: string;
    };
  };
  placement: string;
}

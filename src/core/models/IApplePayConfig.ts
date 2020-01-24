export interface IApplePayConfig {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: {
    countryCode: string;
    currencyCode: string;
    merchantCapabilities: string[];
    supportedNetworks: string[];
    total: {
      label: string;
      amount: string;
    };
  };
  placement: string;
}

export interface IApplePayConfig {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: {
    countryCode: string;
    currencyCode: string;
    merchantCapabilities: string[];
    requestTypes?: string[];
    supportedNetworks: string[];
    total: {
      label: string;
      amount: string;
    };
  };
  requestTypes?: string[];
  placement: string;
}

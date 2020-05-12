export interface IPaymentRequest {
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: string[];
  supportedNetworks: string[];
  requestTypes: string[];
  requiredBillingContactFields: string[];
  requiredShippingContactFields: string[];
  total: {
    label: string;
    amount: string;
  };
}

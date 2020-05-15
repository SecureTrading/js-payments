import { IApplePayLineItem } from './IApplePayLineItem';

export interface IPaymentRequest {
  applicationData?: string;
  billingContact?: any;
  countryCode: string;
  currencyCode: string;
  merchantCapabilities: string[];
  shippingType?: any;
  shippingMethods?: any;
  shippingContact?: any;
  supportedCountries?: any;
  supportedNetworks: string[];
  lineItems?: IApplePayLineItem[];
  requestTypes: string[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
  total: IApplePayLineItem;
}

import { IApplePayLineItem } from './IApplePayLineItem';
import { IApplePayRequestTypes } from './IApplePayRequestTypes';
import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';

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
  supportedNetworks: IApplePaySupportedNetworks[];
  lineItems?: IApplePayLineItem[];
  requestTypes: IApplePayRequestTypes[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
  total: IApplePayLineItem;
}

import { IVisaCheckoutPaymentRequest } from './IVisaCheckoutPaymentRequest';
import { IVisaCheckoutSettings } from './IVisaCheckoutSettings';

export interface IVisaCheckoutInitConfiguration {
  apikey: string;
  paymentRequest: IVisaCheckoutPaymentRequest;
  settings: IVisaCheckoutSettings;
}

import { IVisaSettings } from './IVisaSettings';
import { IVisaPaymentRequest } from './IVisaPaymentRequest';

export interface IVisaInit {
  apikey: string;
  encryptionKey?: string;
  settings?: IVisaSettings;
  paymentRequest?: IVisaPaymentRequest;
}

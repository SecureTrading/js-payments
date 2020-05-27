import { IVisaSettings } from './IVisaSettings';
import { IVisaButtonSettings } from './IVisaButtonSettings';
import { IVisaPaymentRequest } from './IVisaPaymentRequest';
import { IVisaRequestTypes } from './IVisaRequestTypes';

export interface IVisaCheckout {
  merchantId: string; // That's VisaCheckout apikey property
  livestatus: 0 | 1;
  encryptionKey?: string;
  placement: string;
  requestTypes: IVisaRequestTypes[];
  buttonSettings?: IVisaButtonSettings;
  settings?: IVisaSettings;
  paymentRequest?: IVisaPaymentRequest;
}

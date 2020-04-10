import { IVisaSettings } from './IVisaSettings';

export interface IVisaInit {
  apikey: string;
  encryptionKey?: string;
  settings?: IVisaSettings;
  paymentRequest?: {
    merchantRequestId?: string;
    currencyCode?: string;
    subtotal?: string;
    shippingHandling?: string;
    tax?: string;
    discount?: string;
    giftWrap?: string;
    misc?: string;
    total?: string;
    orderId?: string;
    description?: string;
    promoCode?: string;
    customData?: any;
  };
}

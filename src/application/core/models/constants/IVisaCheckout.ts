import { IVisaSettings } from '../../integrations/visa-checkout/IVisaSettings';

export interface IVisaCheckout {
  merchantId: string; // That's VisaCheckout apikey property
  livestatus: 0 | 1;
  encryptionKey?: string;
  placement: string;
  requestTypes: string[];
  buttonSettings?: {
    size: number;
    height?: number;
    width?: number;
    locale?: string;
    color?: 'neutral' | 'standard';
    cardBrands?: string;
    acceptCanadianVisaDebit?: string;
    cobrand?: string;
  };
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

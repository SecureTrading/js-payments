export interface IVisaPaymentRequest {
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
}

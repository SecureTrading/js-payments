import { IApplePayPaymentToken } from './IApplePayPaymentToken';

export interface IApplePayPayment {
  payment: {
    billingContact?: string;
    shippingContact?: string;
    token: IApplePayPaymentToken;
  };
}

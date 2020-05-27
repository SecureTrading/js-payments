import { IPaymentRequest } from './IPaymentRequest';
import { IApplePayRequestTypes } from './IApplePayRequestTypes';

export interface IApplePay {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: IPaymentRequest;
  placement: string;
  requestTypes: IApplePayRequestTypes[];
}

import { IPaymentRequest } from './IPaymentRequest';

export interface IApplePay {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: IPaymentRequest;
  placement: string;
  requestTypes: string[];
}

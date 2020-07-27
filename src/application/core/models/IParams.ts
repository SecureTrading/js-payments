import { IStyles } from '../../../shared/model/config/IStyles';

export interface IParams {
  [name: string]: object | string;
  styles?: IStyles[];
  locale?: string;
  origin?: string;
  jwt?: string;
  gatewayUrl?: string;
  paymentTypes?: string;
  defaultPaymentType?: string;
}

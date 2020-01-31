import { IStyle } from './IStyle';
import { AccountTypeDescription } from '../classes/enum/AccountTypeDescription';

export interface IParams {
  [name: string]: object | string;
  styles?: IStyle;
  locale?: string;
  origin?: string;
  jwt?: string;
  gatewayUrl?: string;
  paymentTypes?: string;
  defaultPaymentType?: string;
  accountType?: AccountTypeDescription;
}

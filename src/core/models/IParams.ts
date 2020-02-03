import { IStyle } from './IStyle';
import { AccountTypeDescription } from '../classes/enum/AccountTypeDescription';

export interface IParams {
  [name: string]: object | string;
  accountType?: AccountTypeDescription;
  defaultPaymentType?: string;
  gatewayUrl?: string;
  jwt?: string;
  locale?: string;
  origin?: string;
  paymentTypes?: string;
  styles?: IStyle;
}

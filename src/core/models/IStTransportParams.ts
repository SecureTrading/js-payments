import { AccountTypeDescription } from '../classes/enum/AccountTypeDescription';

export interface IStTransportParams {
  accountType: AccountTypeDescription;
  gatewayUrl: string;
  jwt: string;
}

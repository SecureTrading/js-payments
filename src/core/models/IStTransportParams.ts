import { AccountTypeDescription } from '../classes/enum/AccountTypeDescription';

export interface IStTransportParams {
  jwt: string;
  gatewayUrl: string;
  accountType: AccountTypeDescription;
}

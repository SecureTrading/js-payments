import { AccountTypeDescription } from '../classes/enum/AccountTypeDescription';

export interface IStRequest {
  accounttypedescription?: AccountTypeDescription;
  expirydate?: string;
  pan?: string;
  requesttypedescription?: string;
  requesttypedescriptions?: string[];
  securitycode?: string;
  termurl?: string;
}

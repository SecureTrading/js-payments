import { AccountTypeDescription } from '../classes/enum/AccountTypeDescription';

export interface IStRequest {
  accounttypedescription?: AccountTypeDescription;
  requesttypedescription?: string;
  requesttypedescriptions?: string[];
  expirydate?: string;
  pan?: string;
  securitycode?: string;
  termurl?: string;
}

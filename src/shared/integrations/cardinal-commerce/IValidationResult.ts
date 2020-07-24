import { ActionCode } from './ActionCode';

export interface IValidationResult {
  Validated: boolean;
  ActionCode: ActionCode;
  ErrorNumber: number;
  ErrorDescription: string;
  jwt?: string;
}

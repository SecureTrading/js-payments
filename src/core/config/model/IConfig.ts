import { BypassCards } from '../../models/constants/BypassCards';
import { IBypassInit } from './IBypassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';
import { IWalletConfig } from './IWalletConfig';
import { IPlaceholdersConfig } from './IPlaceholdersConfig';

export interface IConfig {
  analytics?: boolean;
  animatedCard?: boolean;
  applePay?: IWalletConfig;
  bypassCards?: BypassCards[];
  buttonId?: string;
  components?: IComponentsConfig;
  componentIds?: IComponentsIds;
  datacenterurl?: string;
  deferInit?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  jwt: string;
  init?: IBypassInit;
  livestatus?: number;
  notifications: boolean;
  origin?: string;
  placeholders?: IPlaceholdersConfig;
  styles?: IStyles;
  submitCallback?: any;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  translations?: {};
  visaCheckout?: IWalletConfig;
}

import { BypassCards } from './constants/BypassCards';
import { IBypassInit } from './IBypassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';
import { IWalletConfig } from './IWalletConfig';

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
  origin?: string;
  styles?: IStyles;
  submitCallback?: any;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  translations?: {};
  visaCheckout?: IWalletConfig;
}

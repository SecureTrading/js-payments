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
  buttonId?: string;
  bypassCards?: BypassCards[];
  cachetoken: string;
  componentIds?: IComponentsIds;
  components?: IComponentsConfig;
  datacenterurl?: string;
  deferInit?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  init?: IBypassInit;
  jwt: string;
  livestatus?: number;
  origin?: string;
  panIcon?: boolean;
  placeholders?: IPlaceholdersConfig;
  requestTypes: string[];
  styles?: IStyles;
  submitCallback?: any;
  submitFields?: string[];
  submitOnError?: boolean;
  submitOnSuccess?: boolean;
  threedinit: string;
  translations?: {};
  visaCheckout?: IWalletConfig;
}

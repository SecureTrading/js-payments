import { BypassCards } from '../../../application/core/models/constants/BypassCards';
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
  cachetoken?: string;
  components?: IComponentsConfig;
  componentIds?: IComponentsIds;
  datacenterurl?: string;
  disableNotification: boolean;
  deferInit?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  init?: IBypassInit;
  jwt: string;
  livestatus?: number;
  origin?: string;
  panIcon?: boolean;
  placeholders?: IPlaceholdersConfig;
  requestTypes?: string[];
  styles?: IStyles;
  submitCallback?: any;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  threedinit?: string;
  translations?: {};
  visaCheckout?: IWalletConfig;
}

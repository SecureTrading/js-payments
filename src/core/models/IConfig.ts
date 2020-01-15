import { ByPassCards } from './constants/ByPassCards';
import { IByPassInit } from './IByPassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';
import { IWalletConfig } from './IWalletConfig';

export interface IConfig {
  analytics?: boolean;
  animatedCard?: boolean;
  applePay?: IWalletConfig;
  byPassCards?: ByPassCards[];
  buttonId?: string;
  components?: IComponentsConfig;
  componentIds?: IComponentsIds;
  datacenterurl?: string;
  deferInit?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  jwt: string;
  init?: IByPassInit;
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

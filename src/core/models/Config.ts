import { IStyles } from '../shared/Styler';

export interface IConfig {
  componentIds?: any;
  datacenterurl?: string;
  formId?: string;
  jwt: string;
  origin?: string;
  styles?: IStyles;
  submitFields?: string[];
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  tokenise?: boolean;
}

export interface IComponentsConfig {
  defaultPaymentType: string;
  paymentTypes?: string[];
  startOnLoad?: boolean;
}

export interface IWalletConfig {
  [key: string]: any;
}

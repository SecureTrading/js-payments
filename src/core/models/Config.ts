import { IStyles } from '../shared/Styler';

export interface IConfig {
  componentIds?: any;
  datacenterurl?: string;
  formId?: string;
  jwt: string;
  origin?: string;
  tokenise?: boolean;
  styles?: IStyles;
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  submitFields?: string[];
}

export interface IComponentsConfig {
  startOnLoad?: boolean;
}

export interface IWalletConfig {
  [key: string]: any;
}

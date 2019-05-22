import { IStyles } from '../shared/Styler';

export interface IConfig {
  componentIds?: any;
  jwt: string;
  origin?: string;
  tokenise?: boolean;
  styles?: IStyles;
  submitOnSuccess?: boolean;
  submitOnError?: boolean;
  submitFields?: string[];
}

export interface IComponentsConfig {}

export interface IWalletConfig {
  [key: string]: any;
}

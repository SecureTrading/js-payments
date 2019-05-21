import { IStyles } from '../shared/Styler';

export interface IConfig {
  componentIds?: any;
  jwt: string;
  origin: string;
  step: boolean;
  styles?: IStyles;
}

export interface IComponentsConfig {}

export interface IWalletConfig {
  [key: string]: any;
}

import { IStyles } from '../shared/Styler';

export interface IConfig {
  jwt: string;
  step: boolean;
}

export interface IComponentsConfig {
  fieldsIds: any;
  onlyWallets: boolean;
  origin: string;
  styles: IStyles;
}

export interface IWalletConfig {
  props: object;
}

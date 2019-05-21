import { IStyles } from '../shared/Styler';

export interface IConfig {
  fieldsIds: any;
  jwt: string;
  origin: string;
  step: boolean;
  styles: IStyles;
}

export interface IComponentsConfig {}

export interface IWalletConfig {
  props: object;
}

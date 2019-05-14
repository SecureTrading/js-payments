import { IStyles } from '../shared/Styler';

export interface IConfig {
  jwt: string;
  fieldsIds: any;
  onlyWallets: boolean;
  origin: string;
  step: boolean;
  styles: IStyles;
  wallets: object[];
}

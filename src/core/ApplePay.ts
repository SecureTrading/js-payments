import Wallet from './classes/Wallet.class';
import { IWalletConfig } from './models/Config';

export default class ApplePay {
  constructor(config: IWalletConfig) {
    const { jwt, step, props } = config;
    const wallet = new Wallet(jwt, step, [{ name: 'APPLEPAY', props }]); // TODO skip out Wallet?
  }
}

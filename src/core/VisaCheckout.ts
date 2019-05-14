import Wallet from './classes/Wallet.class';
import { IWalletConfig } from './models/Config';

export default class VisaCheckout {
  constructor(config: IWalletConfig) {
    const { jwt, step, props } = config;
    const wallet = new Wallet(jwt, step, [{ name: 'VISACHECKOUT', props }]); // TODO skip out Wallet?
  }
}

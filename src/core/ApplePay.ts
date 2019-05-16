import { environment } from '../environments/environment';
import * as integrations from './integrations/ApplePay';
import ApplePayMock from './integrations/ApplePayMock';
import { IWalletConfig } from './models/Config';

export default class ApplePay {
  constructor(config: IWalletConfig) {
    const { jwt, step, props } = config;
    let instance;
    if (environment.testEnvironment) {
      instance = new ApplePayMock({ props }, step, jwt);
    } else {
      instance = new integrations.ApplePay({ props }, step, jwt);
    }
  }
}

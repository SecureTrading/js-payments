import { environment } from '../environments/environment';
import * as integrations from './integrations/VisaCheckout';
import VisaCheckoutMock from './integrations/VisaCheckoutMock';
import { IWalletConfig } from './models/Config';

export default class VisaCheckout {
  constructor(config: IWalletConfig) {
    const { jwt, step, props } = config;
    let instance;
    if (environment.testEnvironment) {
      instance = new VisaCheckoutMock({ props }, step, jwt);
    } else {
      instance = new integrations.VisaCheckout({ props }, step, jwt);
    }
  }
}

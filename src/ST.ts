import Cards from './core/classes/CardFrames.class';
import Form from './core/classes/CommonFrames.class';
import ApplePay from './core/integrations/ApplePay';
import ApplePayMock from './core/integrations/ApplePayMock';
import { CardinalCommerce } from './core/integrations/CardinalCommerce';
import CardinalCommerceMock from './core/integrations/CardinalCommerceMock';
import VisaCheckout from './core/integrations/VisaCheckout';
import VisaCheckoutMock from './core/integrations/VisaCheckoutMock';
import { IComponentsConfig, IConfig, IWalletConfig } from './core/models/Config';
import { IStyles } from './core/shared/Styler';
import { environment } from './environments/environment';

/**
 * Establishes connection with ST, defines client.
 */
class ST {
  private jwt: string;
  private origin: string;
  private tokenise: boolean;
  private styles: IStyles;
  private componentIds: any;

  /**
   * Defines static methods for starting different payment methods
   * @private
   */

  constructor(config: IConfig) {
    config = this._addDefaults(config);
    this.jwt = config.jwt;
    this.componentIds = config.componentIds;
    this.styles = config.styles;
    const instance = new Form(this.jwt, this.origin, this.componentIds, this.styles);
  }

  public Components(config?: IComponentsConfig) {
    config = config ? config : {};
    const instance = new Cards(this.jwt, this.origin, this.componentIds, this.styles);
    const cardinal = environment.testEnvironment
      ? new CardinalCommerceMock(this.tokenise)
      : new CardinalCommerce(this.tokenise);
  }

  public ApplePay(config: IWalletConfig) {
    const instance = environment.testEnvironment
      ? new ApplePayMock(config, this.tokenise, this.jwt)
      : new ApplePay(config, this.tokenise, this.jwt);
  }

  public VisaCheckout(config: IWalletConfig) {
    const instance = environment.testEnvironment
      ? new VisaCheckoutMock(config, this.tokenise, this.jwt)
      : new VisaCheckout(config, this.tokenise, this.jwt);
  }

  private _addDefaults(config: IConfig) {
    this.origin = config.origin ? config.origin : window.location.origin;
    this.tokenise = config.tokenise ? config.tokenise : false;
    const componentIds = {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
      controlFrame: 'st-control-frame',
      expirationDate: 'st-expiration-date',
      notificationFrame: 'st-notification-frame',
      securityCode: 'st-security-code'
    };
    config.componentIds = config.componentIds ? { ...componentIds, ...config.componentIds } : componentIds;
    config.styles = config.styles ? config.styles : {};
    return config;
  }
}

export default (config: IConfig) => new ST(config);

import CardFrames from './core/classes/CardFrames.class';
import CommonFrames from './core/classes/CommonFrames.class';
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
  private submitOnSuccess: boolean;
  private submitOnError: boolean;
  private submitFields: string[];

  /**
   * Defines static methods for starting different payment methods
   * @private
   */

  constructor(config: IConfig) {
    config = this._addDefaults(config);
    this.jwt = config.jwt;
    this.origin = config.origin;
    this.tokenise = config.tokenise;
    this.componentIds = config.componentIds;
    this.styles = config.styles;
    this.submitOnSuccess = config.submitOnSuccess;
    this.submitOnError = config.submitOnError;
    this.submitFields = config.submitFields;
    const instance = new CommonFrames(
      this.jwt,
      this.origin,
      this.componentIds,
      this.styles,
      this.submitOnSuccess,
      this.submitOnError,
      this.submitFields
    );
  }

  public Components(config?: IComponentsConfig) {
    config = config ? config : {};
    config.startOnLoad = config.startOnLoad ? config.startOnLoad : false;
    if (!config.startOnLoad) {
      const instance = new CardFrames(this.jwt, this.origin, this.componentIds, this.styles);
    }
    const cardinal = environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce;
    const cardinalInstance = new cardinal(this.tokenise, config.startOnLoad, this.jwt);
  }

  public ApplePay(config: IWalletConfig) {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    const instance = new applepay(config, this.tokenise, this.jwt);
  }

  public VisaCheckout(config: IWalletConfig) {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
    const instance = new visa(config, this.tokenise, this.jwt);
  }

  private _addDefaults(config: IConfig) {
    config.origin = config.origin ? config.origin : window.location.origin;
    config.tokenise = config.tokenise ? config.tokenise : false;
    config.submitOnSuccess = config.submitOnSuccess ? config.submitOnSuccess : false;
    config.submitOnError = config.submitOnError ? config.submitOnError : false;
    config.submitFields = config.submitFields
      ? config.submitFields
      : [
          'baseamount',
          'currencyiso3a',
          'eci',
          'enrolled',
          'errorcode',
          'errordata',
          'errormessage',
          'orderreference',
          'settlestatus',
          'status'
        ];
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

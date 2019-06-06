import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import CardFrames from './core/classes/CardFrames.class';
import CommonFrames from './core/classes/CommonFrames.class';
import ApplePay from './core/integrations/ApplePay';
import ApplePayMock from './core/integrations/ApplePayMock';
import { CardinalCommerce } from './core/integrations/CardinalCommerce';
import CardinalCommerceMock from './core/integrations/CardinalCommerceMock';
import VisaCheckout from './core/integrations/VisaCheckout';
import VisaCheckoutMock from './core/integrations/VisaCheckoutMock';
import { IComponentsConfig, IConfig, IWalletConfig } from './core/models/Config';
import Selectors from './core/shared/Selectors';
import { IStyles } from './core/shared/Styler';
import { environment } from './environments/environment';

/**
 * Establishes connection with ST, defines client.
 */
class ST {
  private static GATEWAY_URL = environment.GATEWAY_URL;
  private componentIds: any;
  private jwt: string;
  private origin: string;
  private styles: IStyles;
  private submitFields: string[];
  private submitOnError: boolean;
  private submitOnSuccess: boolean;
  private tokenise: boolean;
  private gatewayUrl: string;

  /**
   * Defines static methods for starting different payment methods
   * @private
   */

  constructor(config: IConfig) {
    config = this._addDefaults(config);
    this.componentIds = config.componentIds;
    this.jwt = config.jwt;
    this.origin = config.origin;
    this.styles = config.styles;
    this.submitFields = config.submitFields;
    this.submitOnError = config.submitOnError;
    this.submitOnSuccess = config.submitOnSuccess;
    this.tokenise = config.tokenise;
    Selectors.MERCHANT_FORM_SELECTOR = config.formId ? config.formId : Selectors.MERCHANT_FORM_SELECTOR;
    const instance = new CommonFrames(
      this.jwt,
      this.origin,
      this.componentIds,
      this.styles,
      this.submitOnSuccess,
      this.submitOnError,
      this.submitFields,
      this.gatewayUrl
    );
  }

  public Components(config?: IComponentsConfig) {
    config = config ? config : ({} as IComponentsConfig);
    config.startOnLoad = config.startOnLoad !== undefined ? config.startOnLoad : false;
    if (!config.startOnLoad) {
      const instance = new CardFrames(
        this.jwt,
        this.origin,
        this.componentIds,
        this.styles,
        config.paymentTypes,
        config.defaultPaymentType
      );
    }
    const cardinal = environment.testEnvironment ? CardinalCommerceMock : CardinalCommerce;
    const cardinalInstance = new cardinal(this.tokenise, config.startOnLoad, this.jwt);
  }

  public ApplePay(config: IWalletConfig) {
    const applepay = environment.testEnvironment ? ApplePayMock : ApplePay;
    const instance = new applepay(config, this.tokenise, this.jwt, this.gatewayUrl);
  }

  public VisaCheckout(config: IWalletConfig) {
    const visa = environment.testEnvironment ? VisaCheckoutMock : VisaCheckout;
    const instance = new visa(config, this.tokenise, this.jwt, this.gatewayUrl);
  }

  private _addDefaults(config: IConfig) {
    config.origin = config.origin ? config.origin : window.location.origin;
    config.tokenise = config.tokenise !== undefined ? config.tokenise : false;
    config.submitOnSuccess = config.submitOnSuccess !== undefined ? config.submitOnSuccess : true;
    config.submitOnError = config.submitOnError !== undefined ? config.submitOnError : false;
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
          'status',
          'transactionreference'
        ];
    const componentIds = {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
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

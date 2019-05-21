import { environment } from '../environments/environment';
import Cards from './classes/Cards.class';
import Form from './classes/Form.class';
import ApplePay from './integrations/ApplePay';
import ApplePayMock from './integrations/ApplePayMock';
import { CardinalCommerce } from './integrations/CardinalCommerce';
import CardinalCommerceMock from './integrations/CardinalCommerceMock';
import VisaCheckout from './integrations/VisaCheckout';
import VisaCheckoutMock from './integrations/VisaCheckoutMock';
import { IComponentsConfig, IConfig, IWalletConfig } from './models/Config';
import { IStyles } from './shared/Styler';

/**
 * Establishes connection with ST, defines client.
 */
export default class ST {
  /**
   * Defines static methods for starting different payment methods
   * @private
   */

  public static init(config: IConfig) {
    ST.jwt = config.jwt;
    ST.componentIds = config.componentIds;
    ST.styles = config.styles;
    ST._initForm();
  }

  private _addDefaults(config: IConfig) {
    ST.origin = config.origin ? config.origin : window.location.origin;
    ST.tokenise = config.tokenise ? config.tokenise : false;
    const componentIds = {
      animatedCard: 'st-animated-card',
      cardNumber: 'st-card-number',
      controlFrame: 'st-control-frame',
      expirationDate: 'st-expiration-date',
      notificationFrame: 'st-notification-frame',
      securityCode: 'st-security-code'
    };
    // Default config
    config.componentIds = config.componentIds ? { ...componentIds, ...config.componentIds } : componentIds;
    config.styles = config.styles ? config.styles : {};
    return config;
  }

  public static Components(config?: IComponentsConfig) {
    // Default config
    config = config ? config : {};
    ST._onComponents();
  }

  public static ApplePay(config: IWalletConfig) {
    let instance;
    if (environment.testEnvironment) {
      instance = new ApplePayMock(config, ST.tokenise, ST.jwt);
    } else {
      instance = new ApplePay(config, ST.tokenise, ST.jwt);
    }
  }

  public static VisaCheckout(config: IWalletConfig) {
    let instance;
    if (environment.testEnvironment) {
      instance = new VisaCheckoutMock(config, ST.tokenise, ST.jwt);
    } else {
      instance = new VisaCheckout(config, ST.tokenise, ST.jwt);
    }
  }

  private static jwt: string;
  private static origin: string;
  private static tokenise: boolean;
  private static styles: IStyles;
  private static componentIds: any;

  /**
   * Starts library initialization
   * @private
   */
  private static _onComponents() {
    ST._initCards();
    ST._init3DSecure();
  }

  /**
   * Inits Cardinal Commerce
   * @private
   */
  private static _init3DSecure = () =>
    environment.testEnvironment ? new CardinalCommerceMock(ST.tokenise) : new CardinalCommerce(ST.tokenise);

  /**
   * Inits form fields
   * @private
   */
  private static _initCards = () => new Cards(ST.jwt, ST.origin, ST.componentIds, ST.styles);

  /**
   * Inits control and notification frames
   * @private
   */
  private static _initForm = () => new Form(ST.jwt, ST.origin, ST.componentIds, ST.styles);
}

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
    ST.fieldsIds = config.fieldsIds;
    ST.jwt = config.jwt;
    ST.origin = config.origin;
    ST.step = config.step;
    ST.styles = config.styles;
    ST._initForm();
  }

  public static Components(config: IComponentsConfig) {
    ST._onInit();
  }

  public static ApplePay(config: IWalletConfig) {
    let instance;
    if (environment.testEnvironment) {
      instance = new ApplePayMock(config, ST.step, ST.jwt);
    } else {
      instance = new ApplePay(config, ST.step, ST.jwt);
    }
  }

  public static VisaCheckout(config: IWalletConfig) {
    let instance;
    if (environment.testEnvironment) {
      instance = new VisaCheckoutMock(config, ST.step, ST.jwt);
    } else {
      instance = new VisaCheckout(config, ST.step, ST.jwt);
    }
  }

  private static jwt: string;
  private static origin: string;
  private static step: boolean;
  private static fieldsIds: any;
  private static styles: IStyles;

  /**
   * Starts library initialization
   * @private
   */
  private static _onInit() {
    ST._initCards();
    ST._init3DSecure();
  }

  /**
   * Inits Cardinal Commerce
   * @private
   */
  private static _init3DSecure = () =>
    environment.testEnvironment ? new CardinalCommerceMock(ST.step) : new CardinalCommerce(ST.step);

  /**
   * Inits form fields
   * @private
   */
  private static _initCards = () => new Cards(ST.jwt, ST.origin, ST.fieldsIds, ST.styles);

  /**
   * Inits control and notification frames
   * @private
   */
  private static _initForm = () => new Form(ST.jwt, ST.origin, ST.fieldsIds, ST.styles);
}

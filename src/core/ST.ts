import { environment } from '../environments/environment';
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

  public static Create(config: IConfig) {
    // TODO this should always create Notification frame so it's available for all payment methods
    // (basically taking it out of Form and getting rid of onlyWallets)
    ST.jwt = config.jwt;
    ST.step = config.step;
  }

  public static Components(config: IComponentsConfig) {
    // TODO add validation to this and other interfaces to check they have always called Create first
    ST.origin = config.origin;
    ST.onlyWallets = config.onlyWallets;
    ST.fieldsIds = config.fieldsIds;
    ST.styles = config.styles;
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
  private static onlyWallets: boolean;
  private static fieldsIds: any;
  private static styles: IStyles;

  /**
   * Starts library initialization
   * @private
   */
  private static _onInit() {
    ST._initForm();
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
  private static _initForm = () => new Form(ST.jwt, ST.origin, ST.onlyWallets, ST.fieldsIds, ST.styles);
}

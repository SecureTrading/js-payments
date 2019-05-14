import { environment } from '../environments/environment';
import Form from './classes/Form.class';
import { CardinalCommerce } from './integrations/CardinalCommerce';
import CardinalCommerceMock from './integrations/CardinalCommerceMock';
import { IConfig } from './models/Config';
import { IStyles } from './shared/Styler';

/**
 * Establishes connection with ST, defines client.
 */
export default class Components {
  /**
   * Inits Cardinal Commerce
   * @private
   */

  private readonly jwt: string;
  private readonly origin: string;
  private readonly step: boolean;
  private readonly onlyWallets: boolean;
  private readonly fieldsIds: any;
  private readonly styles: IStyles;

  constructor(config: IConfig) {
    this.jwt = config.jwt;
    this.origin = config.origin;
    this.step = config.step;
    this.onlyWallets = config.onlyWallets;
    this.fieldsIds = config.fieldsIds;
    this.styles = config.styles;
    this._onInit();
  }

  /**
   * Starts library initialization
   * @private
   */
  private _onInit() {
    this._initForm();
    this._init3DSecure();
  }

  /**
   * Inits Cardinal Commerce
   * @private
   */
  private _init3DSecure = () =>
    environment.testEnvironment ? new CardinalCommerceMock(this.step) : new CardinalCommerce(this.step);

  /**
   * Inits form fields
   * @private
   */
  private _initForm = () => new Form(this.jwt, this.origin, this.onlyWallets, this.fieldsIds, this.styles);
}

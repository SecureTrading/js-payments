import { environment } from '../environments/environment';
import Form from './classes/Form.class';
import Wallet from './classes/Wallet.class';
import { CardinalCommerce } from './integrations/CardinalCommerce';
import CardinalCommerceMock from './integrations/CardinalCommerceMock';
import { IStyles } from './shared/Styler';

/**
 * Establishes connection with ST, defines client.
 */
export default class ST {
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
  private readonly wallets: object[];

  constructor(
    jwt: string,
    origin: string,
    step: boolean,
    onlyWallets: boolean,
    fieldsIds: any,
    styles: IStyles,
    wallets: object[]
  ) {
    this.jwt = jwt;
    this.origin = origin;
    this.step = step;
    this.onlyWallets = onlyWallets;
    this.fieldsIds = fieldsIds;
    this.styles = styles;
    this.wallets = wallets;
    this._onInit();
  }

  /**
   * Starts library initialization
   * @private
   */
  private _onInit() {
    this._initForm();
    this._initWallets();
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

  /**
   * Inits Alternative Payment Methods
   * @private
   */
  private _initWallets = () => new Wallet(this.jwt, this.step, this.wallets);
}

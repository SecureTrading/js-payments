import Form from './classes/Form.class';
import CardinalCommerce from './classes/CardinalCommerce';
import Wallet from './classes/Wallet.class';
import MessageBus from './shared/MessageBus';
import Selectors from './shared/Selectors';
import { Styles } from './shared/Styler';

/**
 * Establishes connection with ST, defines client.
 */
export default class ST {
  private readonly jwt: string;
  private readonly origin: string;
  private readonly onlyWallets: boolean;
  private readonly fieldsIds: any;
  private readonly styles: Styles;
  private readonly wallets: object[];
  private messageBusInstance: MessageBus;

  constructor(jwt: string, origin: string, onlyWallets: boolean, fieldsIds: any, styles: Styles, wallets: object[]) {
    this.jwt = jwt;
    this.origin = origin;
    this.onlyWallets = onlyWallets;
    this.fieldsIds = fieldsIds;
    this.styles = styles;
    this.wallets = wallets;
    this.messageBusInstance = new MessageBus();
    this._onInit();
  }

  private _onInit() {
    this._initForm();
    this._initWallets();
    ST._init3DSecure();
    this._setFormListener();
  }

  private static _init3DSecure = () => new CardinalCommerce();
  private _initForm = () => new Form(this.jwt, this.origin, this.onlyWallets, this.fieldsIds, this.styles);
  private _initWallets = () => new Wallet(this.jwt, this.wallets);

  private _setFormListener() {
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      const messageBusEvent: MessageBusEvent = { type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM };
      this.messageBusInstance.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
    });
  }
}

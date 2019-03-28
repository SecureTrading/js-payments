import { apmsNames } from './imports/apms';
import Element from './Element';
import CardinalCommerce from './classes/CardinalCommerce';
import VisaCheckout from './classes/VisaCheckout';

/***
 * Establishes connection with ST, defines client.
 */
export default class ST {
  public jwt: string;
  public fieldsIds: any;
  public errorContainerId: string;
  public style: object;
  public payments: object[];

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public static registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  constructor(jwt: string, fieldsIds: any, errorContainerId: string, style: object, payments: object[]) {
    this.jwt = jwt;
    this.fieldsIds = fieldsIds;
    this.errorContainerId = errorContainerId;
    this.style = style;
    this.payments = payments;

    this._onInit();
  }

  private _onInit() {
    this._initElements();
    this._init3DSecure(this.jwt);
    this._initWallets(this.jwt);
  }

  private _initElements() {
    const cardNumber = new Element();
    const expirationDate = new Element();
    const securityCode = new Element();
    const notificationFrame = new Element();
    const controlFrame = new Element();

    cardNumber.create(Element.CARD_NUMBER_COMPONENT_NAME);
    const cardNumberMounted = cardNumber.mount(Element.CARD_NUMBER_COMPONENT_FRAME);

    expirationDate.create(Element.EXPIRATION_DATE_COMPONENT_NAME);
    const expirationDateMounted = expirationDate.mount(Element.EXPIRATION_DATE_COMPONENT_FRAME);

    securityCode.create(Element.SECURITY_CODE_COMPONENT_NAME);
    const securityCodeMounted = securityCode.mount(Element.SECURITY_CODE_COMPONENT_FRAME);

    notificationFrame.create(Element.NOTIFICATION_FRAME_COMPONENT_NAME);
    const notificationFrameMounted = notificationFrame.mount(Element.NOTIFICATION_FRAME_COMPONENT_FRAME);

    controlFrame.create(Element.CONTROL_FRAME_COMPONENT_NAME);
    const controlFrameMounted = controlFrame.mount(Element.CONTROL_FRAME_COMPONENT_FRAME);

    ST.registerElements(
      [cardNumberMounted, expirationDateMounted, securityCodeMounted, notificationFrameMounted, controlFrameMounted],
      [
        this.fieldsIds.cardNumber,
        this.fieldsIds.expirationDate,
        this.fieldsIds.securityCode,
        this.errorContainerId,
        this.fieldsIds.controlFrame
      ]
    );
  }

  private _init3DSecure(jwt: string) {
    new CardinalCommerce(jwt);
  }

  private _initWallets(jwt: string) {
    let visaCheckoutConfig = this._getAPMConfig(apmsNames.visaCheckout);

    if (visaCheckoutConfig) {
      new VisaCheckout(visaCheckoutConfig, jwt);
    }
  }

  /**
   * Gets APM config according to given apmName
   * @param apmName - name of payment
   * @private
   */
  private _getAPMConfig(apmName: string) {
    return Object.values(this.payments).find((item: { name: string }) => item.name === apmName);
  }
}

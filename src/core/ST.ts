import VisaCheckout from './classes/VisaCheckout';
import Element from './Element';
import { environment } from '../environments/environment';
import CardinalCommerce from './classes/CardinalCommerce';
import { GATEWAY_URL } from './imports/cardinalSettings';
import Selectors from './shared/Selectors';
import { Styles } from './shared/Styler';

/***
 * Establishes connection with ST, defines client.
 */
export default class ST {
  public jwt: string;
  public fieldsIds: any;
  public errorContainerId: string;
  public styles: Styles;
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

  constructor(jwt: string, fieldsIds: any, errorContainerId: string, styles: Styles, payments: object[]) {
    const gatewayUrl = GATEWAY_URL;
    this.styles = styles;
    this.payments = payments;
    this.fieldsIds = fieldsIds;

    const cardNumber = new Element();
    const securityCode = new Element();
    const expirationDate = new Element();
    const animatedCard = new Element();
    const notificationFrame = new Element();
    const controlFrame = new Element();

    new CardinalCommerce(jwt, gatewayUrl);

    cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles);
    const cardNumberMounted = cardNumber.mount(Selectors.CARD_NUMBER_COMPONENT_FRAME);

    securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles);
    const securityCodeMounted = securityCode.mount(Selectors.SECURITY_CODE_COMPONENT_FRAME);

    expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles);
    const expirationDateMounted = expirationDate.mount(Selectors.EXPIRATION_DATE_COMPONENT_FRAME);

    notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles);
    const notificationFrameMounted = notificationFrame.mount(Selectors.NOTIFICATION_FRAME_COMPONENT_FRAME);

    controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles);
    const controlFrameMounted = controlFrame.mount(Selectors.CONTROL_FRAME_COMPONENT_FRAME);

    animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME);
    const animatedCardMounted = animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME);

    ST.registerElements(
      [
        cardNumberMounted,
        securityCodeMounted,
        expirationDateMounted,
        notificationFrameMounted,
        controlFrameMounted,
        animatedCardMounted
      ],
      [
        this.fieldsIds.cardNumber,
        this.fieldsIds.securityCode,
        this.fieldsIds.expirationDate,
        this.fieldsIds.notificationFrame,
        this.fieldsIds.controlFrame,
        this.fieldsIds.animatedCard
      ]
    );

    if (this._getAPMConfig(environment.APM_NAMES.VISA_CHECKOUT)) {
      new VisaCheckout(this._getAPMConfig(environment.APM_NAMES.VISA_CHECKOUT), jwt);
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

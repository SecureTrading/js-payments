import VisaCheckout from './classes/VisaCheckout';
import Element from './Element';
import { apmsNames } from './imports/apms';
import CardinalCommerce from './classes/CardinalCommerce';
import { GATEWAY_URL } from './imports/cardinalSettings';

/***
 * Establishes connection with ST, defines client.
 */
export default class ST {
  public jwt: string;
  public fieldsIds: any;
  public errorContainerId: string;
  public style: object;
  public animatedCardContainerId: string;
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

  constructor(
    errorContainerId: string,
    animatedCardContainerId: string,
    jwt: string,
    fieldsIds: any,
    style: object,
    payments: object[]
  ) {
    const gatewayUrl = GATEWAY_URL;
    this.style = style;
    this.payments = payments;
    this.fieldsIds = fieldsIds;
    this.errorContainerId = errorContainerId;
    this.animatedCardContainerId = animatedCardContainerId;

    const cardNumber = new Element();
    const securityCode = new Element();
    const expirationDate = new Element();
    const animatedCard = new Element();
    const notificationFrame = new Element();
    const controlFrame = new Element();

    new CardinalCommerce(jwt, gatewayUrl);

    cardNumber.create(Element.CARD_NUMBER_COMPONENT_NAME);
    const cardNumberMounted = cardNumber.mount(Element.CARD_NUMBER_COMPONENT_FRAME);

    securityCode.create(Element.SECURITY_CODE_COMPONENT_NAME);
    const securityCodeMounted = securityCode.mount(Element.SECURITY_CODE_COMPONENT_FRAME);

    expirationDate.create(Element.EXPIRATION_DATE_COMPONENT_NAME);
    const expirationDateMounted = expirationDate.mount(Element.EXPIRATION_DATE_COMPONENT_FRAME);

    notificationFrame.create(Element.NOTIFICATION_FRAME_COMPONENT_NAME);
    const notificationFrameMounted = notificationFrame.mount(Element.NOTIFICATION_FRAME_COMPONENT_FRAME);

    controlFrame.create(Element.CONTROL_FRAME_COMPONENT_NAME);
    const controlFrameMounted = controlFrame.mount(Element.CONTROL_FRAME_COMPONENT_FRAME);

    animatedCard.create(Element.ANIMATED_CARD_COMPONENT_NAME);
    const animatedCardMounted = animatedCard.mount(Element.ANIMATED_CARD_COMPONENT_NAME);

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
        this.errorContainerId,
        this.fieldsIds.controlFrame,
        this.animatedCardContainerId
      ]
    );

    if (this._getAPMConfig(apmsNames.visaCheckout)) {
      new VisaCheckout(this._getAPMConfig(apmsNames.visaCheckout), jwt);
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

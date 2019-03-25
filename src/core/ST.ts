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

  public static cardNumberComponent = '/card-number.html';
  public static expirationDateComponent = '/expiration-date.html';
  public static securityCodeComponent = '/security-code.html';
  public static animatedCardComponent = 'http://localhost:8080/animated-card.html';

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

  private static _iframeCreditCardId: string = 'st-card-number-iframe';
  private static _iframeSecurityCodeId: string = 'st-security-code-iframe';
  private static _iframeExpirationDateId: string = 'st-expiration-date-iframe';
  private static _iframeAnimatedCardId: string = 'st-animated-card-iframe';

  constructor(
    animatedCardContainerId: string,
    jwt: string,
    fieldsIds: any,
    errorContainerId: string,
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

    animatedCard.create('animatedCard');
    const animatedCardMounted = animatedCard.mount('st-animated-card-iframe');

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
      const visa = new VisaCheckout(this._getAPMConfig(apmsNames.visaCheckout), jwt);
    }

    document.getElementById('test-button').addEventListener('click', () => {
      const anmatedCardIframe = document.getElementById(ST._iframeAnimatedCardId) as HTMLIFrameElement;
      const animatedCardContentWindow = anmatedCardIframe.contentWindow;
      animatedCardContentWindow.postMessage(
        {
          //@ts-ignore
          type: document.getElementById('animated-card-number-brand').value,
          name: 'cardNumber',
          //@ts-ignore
          value: document.getElementById('animated-card-number').value
        },
        ST.animatedCardComponent
      );
    });
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

import VisaCheckout from './classes/VisaCheckout';
import Element from './Element';
import { apmsNames } from './imports/apms';
import CardinalCommerce from './classes/CardinalCommerce';
import { GATEWAY_URL } from './imports/cardinalSettings';

/***
 * Establishes connection with ST, defines client.
 */
class ST {
  public jwt: string;
  public sitereference: string;
  public style: object;
  public errorContainerId: string;
  public animatedCardContainerId: string;
  public payments: object[];
  public fieldsIds: any;

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
    style: object,
    errorContainerId: string,
    animatedCardContainerId: string,
    jwt: string,
    fieldsIds: any,
    sitereference: string,
    payments: object[]
  ) {
    const gatewayUrl = GATEWAY_URL;
    this.style = style;
    this.payments = payments;
    this.sitereference = sitereference;
    this.fieldsIds = fieldsIds;
    this.errorContainerId = errorContainerId;
    this.animatedCardContainerId = animatedCardContainerId;

    const cardNumber = new Element();
    const securityCode = new Element();
    const expirationDate = new Element();
    const animatedCard = new Element();
    const notificationFrame = new Element();

    new CardinalCommerce(jwt, sitereference, gatewayUrl);

    cardNumber.create('cardNumber');
    this.submitListener();

    const cardNumberMounted = cardNumber.mount('st-card-number-iframe');

    securityCode.create('securityCode');
    const securityCodeMounted = securityCode.mount('st-security-code-iframe');

    expirationDate.create('expirationDate');
    const expirationDateMounted = expirationDate.mount('st-expiration-date-iframe');

    notificationFrame.create('notificationFrame');
    const notificationFrameMounted = notificationFrame.mount('st-notification-frame-iframe');

    animatedCard.create('animatedCard');
    const animatedCardMounted = animatedCard.mount('st-animated-card-iframe');

    ST.registerElements(
      [cardNumberMounted, securityCodeMounted, expirationDateMounted, notificationFrameMounted, animatedCardMounted],
      [
        this.fieldsIds.cardNumber,
        this.fieldsIds.securityCode,
        this.fieldsIds.expirationDate,
        this.errorContainerId,
        this.animatedCardContainerId
      ]
    );

    if (this._getAPMConfig(apmsNames.visaCheckout)) {
      const visa = new VisaCheckout(this._getAPMConfig(apmsNames.visaCheckout));
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
   * Listens to submit and gives iframes a sign that post has been done
   */
  public submitListener = () => {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('submit', event => {
        event.preventDefault();
        const creditCardIframe = document.getElementById(ST._iframeCreditCardId) as HTMLIFrameElement;
        const securityCodeIframe = document.getElementById(ST._iframeSecurityCodeId) as HTMLIFrameElement;
        const expirationDateIframe = document.getElementById(ST._iframeExpirationDateId) as HTMLIFrameElement;
        const anmatedCardIframe = document.getElementById(ST._iframeAnimatedCardId) as HTMLIFrameElement;
        const creditCardContentWindow = creditCardIframe.contentWindow;
        const securityCodeContentWindow = securityCodeIframe.contentWindow;
        const expirationDateContentWindow = expirationDateIframe.contentWindow;
        const animatedCardContentWindow = anmatedCardIframe.contentWindow;
        // creditCardContentWindow.postMessage('message', ST.cardNumberComponent);
        // securityCodeContentWindow.postMessage('message', ST.securityCodeComponent);
        // expirationDateContentWindow.postMessage('message', ST.expirationDateComponent);
      });
    });
  };

  /**
   * Gets APM config according to given apmName
   * @param apmName - name of payment
   * @private
   */
  private _getAPMConfig(apmName: string) {
    return Object.values(this.payments).find((item: { name: string }) => item.name === apmName);
  }
}

export default ST;

import CardinalCommerce from './classes/CardinalCommerce';
import StTransport from './classes/StTransport.class';
import Element from './Element';

// @ts-ignore
const jwt: string = document.getElementById('JWTContainer').value;

/***
 * Establishes connection with ST, defines client.
 */
class ST extends StTransport {
  public jwt: string;
  public style: object;
  public errorContainerId: string;
  public payments: object[];

  private static _iframeCreditCardId: string = 'st-card-number-iframe';
  private static _iframeSecurityCodeId: string = 'st-security-code-iframe';
  private static _iframeExpirationDateId: string = 'st-expiration-date-iframe';

  public static cardNumberComponent = '/card-number.html';
  public static expirationDateComponent = '/expiration-date.html';
  public static securityCodeComponent = '/security-code.html';

  // @ts-ignore
  constructor(style: object, errorContainerId: string, payments: object[]) {
    const gatewayUrl = ST.GATEWAY_URL;
    super({ jwt, gatewayUrl });
    this.style = style;
    this.payments = payments;
    this.errorContainerId = errorContainerId;
    const cardNumber = new Element();

    const securityCode = new Element();
    const expirationDate = new Element();
    const notificationFrame = new Element();
    new CardinalCommerce(jwt, gatewayUrl);
    // @ts-ignore
    cardNumber.create('cardNumber');

    this.submitListener();

    const cardNumberMounted = cardNumber.mount('st-card-number-iframe');

    securityCode.create('securityCode');
    const securityCodeMounted = securityCode.mount('st-security-code-iframe');

    expirationDate.create('expirationDate');
    const expirationDateMounted = expirationDate.mount('st-expiration-date-iframe');

    notificationFrame.create('notificationFrame');
    const notificationFrameMounted = notificationFrame.mount('st-notification-frame-iframe');

    ST.registerElements(
      [cardNumberMounted, securityCodeMounted, expirationDateMounted, notificationFrameMounted],
      ['st-card-number', 'st-security-code', 'st-expiration-date', this.errorContainerId]
    );
    window.addEventListener('click', () => {
      const notify = document.getElementById('st-notification-frame-iframe') as HTMLIFrameElement;
      const notificationContentWindow = notify.contentWindow;
      notificationContentWindow.postMessage(
        { type: 'cancel', content: 'There is some test message' },
        'http://localhost:8080/notification-frame.html'
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
        const creditCardContentWindow = creditCardIframe.contentWindow;
        const securityCodeContentWindow = securityCodeIframe.contentWindow;
        const expirationDateContentWindow = expirationDateIframe.contentWindow;

        creditCardContentWindow.postMessage('message', ST.cardNumberComponent);
        securityCodeContentWindow.postMessage('message', ST.securityCodeComponent);
        expirationDateContentWindow.postMessage('message', ST.expirationDateComponent);
      });
    });
  };

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
}

export default ST;

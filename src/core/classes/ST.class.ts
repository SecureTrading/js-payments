/***
 * Establishes connection with ST, defines client.
 */
import { elementClasses, elementStyles } from '../../../examples/example';
import { RegisterElements } from '../helpers/mount';
import Element from './Element.class';
import StTransport from './StTransport.class';
import VisaCheckout from './VisaCheckout.class';

class ST extends StTransport {
  public jwt: string;
  public style: object;
  public payments: object[];

  constructor(jwt: string, style: object, payments: object[]) {
    const gatewayUrl = ST.GATEWAY_URL;
    super({ jwt, gatewayUrl });
    this.jwt = jwt;
    this.style = style;
    this.payments = payments;

    const cardNumber = new Element();
    const securityCode = new Element();
    const expirationDate = new Element();

    cardNumber.create('cardNumber', {
      classes: elementClasses,
      style: elementStyles
    });
    const cardNumberMounted = cardNumber.mount('st-card-number-iframe');

    securityCode.create('securityCode', {
      classes: elementClasses,
      style: elementStyles
    });
    const securityCodeMounted = securityCode.mount('st-security-code-iframe');

    expirationDate.create('expirationDate', {
      classes: elementClasses,
      style: elementStyles
    });
    const expirationDateMounted = expirationDate.mount(
      'st-expiration-date-iframe'
    );

    RegisterElements(
      [cardNumberMounted, securityCodeMounted, expirationDateMounted],
      ['st-card-number', 'st-security-code', 'st-expiration-date']
    );

    if (this._getAPMConfig('VISA')) {
      new VisaCheckout(this._getAPMConfig('VISA'));
    }
  }

  /**
   * Gets APM config according to given apmName
   * @param apmName - name of payment
   * @private
   */
  private _getAPMConfig(apmName: string) {
    return Object.values(this.payments).find(
      (item: { name: string }) => item.name === apmName
    );
  }
}

export default ST;

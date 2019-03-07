import { elementClasses, elementStyles } from '../../../examples/example';
import { RegisterElements } from '../helpers/mount';
import CardinalCommerce from './CardinalCommerce.class';
import Element from './Element.class';

/***
 * Establishes connection with ST, defines client.
 */
class ST {
  public jwt: string;
  public style: object;
  public payments: object[];

  constructor(jwt: string, style: object, payments: object[]) {
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

    const ccIntegration = new CardinalCommerce();
  }
}

export default ST;

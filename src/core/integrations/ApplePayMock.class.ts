import { environment } from '../../environments/environment';
import DomMethods from '../shared/DomMethods';
import ApplePay from './ApplePay.class';

/**
 * Mocked version of Apple Pay setting test environment for Apple Pay automated tests.
 */
class ApplePayMock extends ApplePay {
  public paymentDetails: {};
  public placement: string;

  constructor(config: any, jwt: string) {
    super(config, jwt);
    this.jwt = jwt;
    this.placement = config.placement;
    this.attachMockButton();
    this._setActionOnMockedButton();
  }

  /**
   * Attach created Apple Pay button into DOM
   */
  public attachMockButton() {
    DomMethods.appendChildIntoDOM(this.placement, this._createMockButton());
  }

  /**
   * Creates Apple Pay button element created from base64 image
   * @private
   */
  public _createMockButton = () =>
    DomMethods.createHtmlElement.apply(this, [
      { src: environment.APPLE_PAY_URLS.BUTTON_IMAGE, id: 'applePayButton' },
      'img'
    ]);

  /**
   * Sets action on appended mocked Visa Checkout button
   * @private
   */
  private _setActionOnMockedButton() {
    DomMethods.addListener('applePayButton', 'click', () => {
      this._getMockedData().then(() => {
        this._proceedFlowWithMockedData();
      });
    });
  }

  /**
   * Retrieves Apple Pay data from test endpoint
   * @private
   */
  private _getMockedData() {
    return fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        this.paymentDetails = data;
        return this.paymentDetails;
      });
  }

  /**
   * Proceeds payment flow with mocked data
   * @private
   */
  private _proceedFlowWithMockedData() {
    this.setNotification('payment status', 'response');
  }
}

export default ApplePayMock;

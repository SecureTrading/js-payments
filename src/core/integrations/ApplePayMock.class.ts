import { environment } from '../../environments/environment';
import ApplePay from './ApplePay.class';
import DomMethods from '../shared/DomMethods';

/**
 * Mocked version of Apple Pay setting test environment for Apple Pay automated tests.
 */
class ApplePayMock extends ApplePay {
  public paymentDetails: {};

  constructor(config: any, jwt: string) {
    super(config, jwt);
    this._onMockInit();
  }

  /**
   * Starts mocked Apple Pay flow
   * @private
   */
  private _onMockInit() {
    this._attachMockButton();
    this._setActionOnMockedButton();
  }

  /**
   * Attach created Apple Pay button into DOM
   */
  private _attachMockButton = () => DomMethods.appendChildIntoDOM(this.placement, this._createMockedButton());

  /**
   * Creates Apple Pay button element created from base64 image
   * @private
   */
  private _createMockedButton = () =>
    DomMethods.createHtmlElement.apply(this, [
      { src: environment.APPLE_PAY_URLS.BUTTON_IMAGE, id: ApplePayMock.APPLE_PAY_BUTTON_ID },
      'img'
    ]);

  /**
   * Sets action on appended mocked Visa Checkout button
   * @private
   */
  private _setActionOnMockedButton() {
    DomMethods.addListener(ApplePayMock.APPLE_PAY_BUTTON_ID, 'click', () => {
      this._getWalletverifyData().then(() => {
        this._proceedFlowWithMockedData();
      });
    });
  }

  /**
   * Retrieves Apple Pay data from test endpoint
   * @private
   */
  private _getWalletverifyData() {
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

import { environment } from '../../environments/environment';
import { applePayButton } from '../imports/images';
import { NotificationType } from '../models/NotificationEvent';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import ApplePay from './ApplePay';

/**
 * Mocked version of Apple Pay setting test environment for Apple Pay automated tests.
 */
class ApplePayMock extends ApplePay {
  /**
   * Retrieves Apple Pay data from test endpoint
   * @private
   */
  private static _getWalletverifyData() {
    return fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        return data;
      });
  }

  public paymentDetails: string;
  private _step: boolean;

  constructor(config: any, step: boolean, jwt: string) {
    super(config, step, jwt);
    this._step = step;
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
    DomMethods.createHtmlElement.apply(this, [{ src: applePayButton, id: 'st-apple-pay-mock' }, 'img']);

  /**
   * Sets action on appended mocked Visa Checkout button
   * @private
   */
  private _setActionOnMockedButton() {
    DomMethods.addListener('st-apple-pay-mock', 'click', () => {
      ApplePayMock._getWalletverifyData().then((data: any) => {
        this.paymentDetails = JSON.stringify(data);
        this._proceedFlowWithMockedData();
      });
    });
  }

  /**
   * Proceeds payment flow with mocked data
   * @private
   */
  private _proceedFlowWithMockedData() {
    const paymentDetails = JSON.parse(this.paymentDetails);
    // @ts-ignore
    if (paymentDetails.walletsession) {
      this.onValidateMerchantResponseSuccess(paymentDetails);
      this.mockedPaymentProcess();
    } else {
      this.onValidateMerchantResponseFailure(paymentDetails);
    }
  }

  /**
   * Mocked AUTH process after this.session.completePayment()
   * @private
   */
  private mockedPaymentProcess() {
    this.payment
      .processPayment(
        {
          requesttypedescription: this._step ? 'CACHETOKENISE' : 'AUTH'
        },
        {
          walletsource: this.validateMerchantRequestData.walletsource,
          wallettoken: this.paymentDetails
        },
        DomMethods.parseMerchantForm()
      )
      .then(() => {
        this.setNotification(NotificationType.Success, Language.translations.PAYMENT_AUTHORIZED);
      })
      .catch(() => {
        this.setNotification(NotificationType.Error, Language.translations.PAYMENT_ERROR);
      });
  }
}

export default ApplePayMock;

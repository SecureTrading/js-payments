import { environment } from '../../environments/environment';
import { NotificationType } from '../models/NotificationEvent';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import VisaCheckout from './VisaCheckout';

class VisaCheckoutMock extends VisaCheckout {
  constructor(config: any, step: boolean, jwt: string) {
    super(config, step, jwt);
    this._attachVisaButton();
    this._setActionOnMockedButton();
  }

  /**
   * Sets action on appended mocked Visa Checkout button
   * @private
   */
  private _setActionOnMockedButton() {
    DomMethods.addListener(this._visaCheckoutButtonProps.id, 'click', () => {
      this._setMockedData().then(() => {
        this._proceedFlowWithMockedData();
      });
    });
  }

  /**
   * Retrieves data from mocked data endpoint
   * @private
   */
  private _setMockedData() {
    return fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
      .then((response: any) => response.json())
      .then(({ payment, status }: any) => {
        this.paymentDetails = JSON.stringify(payment);
        this.paymentStatus = status;
        return this.paymentDetails;
      })
      .catch(() => {
        this.setNotification(NotificationType.Error, Language.translations.PAYMENT_ERROR);
      });
  }

  /**
   * Proceeds payment flow with mocked data
   * @private
   */
  private _proceedFlowWithMockedData() {
    this.getResponseMessage(this.paymentStatus);
    this._processPayment();
  }
}

export default VisaCheckoutMock;

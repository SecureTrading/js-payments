import { environment } from '../../environments/environment';
import { NotificationType } from '../models/NotificationEvent';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import VisaCheckout from './VisaCheckout';

class VisaCheckoutMock extends VisaCheckout {
  /**
   * Init configuration and payment data
   * @protected
   */
  protected _initPaymentConfiguration() {
    // Do nothing on mock because we don't want to use V.
  }

  /**
   * Sets action on appended mocked Visa Checkout button
   * @protected
   */
  protected _paymentStatusHandler() {
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
        this.paymentDetails = payment;
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
    if (this.paymentStatus === 'SUCCESS') {
      this._onSuccess(JSON.parse(this.paymentDetails));
    } else if (this.paymentStatus === 'ERROR') {
      this._onError();
    } else if (this.paymentStatus === 'WARNING') {
      this._onCancel();
    }
  }
}

export default VisaCheckoutMock;

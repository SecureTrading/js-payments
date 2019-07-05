import { environment } from '../../environments/environment';
import DomMethods from '../shared/DomMethods';
import VisaCheckout from './VisaCheckout';

class VisaCheckoutMock extends VisaCheckout {
  /**
   * Init configuration and payment data
   */
  protected initPaymentConfiguration() {
    // Do nothing on mock because we don't want to use V.
  }

  /**
   * Sets action on appended mocked Visa Checkout button
   */
  protected paymentStatusHandler() {
    DomMethods.addListener(this.visaCheckoutButtonProps.id, 'click', () => {
      this._handleMockedData();
    });
  }

  /**
   * Retrieves data from mocked data endpoint
   * @private
   */
  private _handleMockedData() {
    return fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
      .then((response: any) => response.json())
      .then(({ payment, status }: any) => {
        this._proceedFlowWithMockedData(payment, status);
      });
  }

  /**
   * Proceeds payment flow with mocked data
   * @private
   */
  private _proceedFlowWithMockedData(payment: any, status: string) {
    if (status === 'SUCCESS') {
      this.onSuccess(payment);
    } else if (status === 'ERROR') {
      this.onError();
    } else if (status === 'WARNING') {
      this.onCancel();
    }
  }
}

export default VisaCheckoutMock;

import { environment } from '../../environments/environment';
import DomMethods from '../shared/DomMethods';
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
      this._onSuccess(payment);
    } else if (status === 'ERROR') {
      this._onError();
    } else if (status === 'WARNING') {
      this._onCancel();
    }
  }
}

export default VisaCheckoutMock;

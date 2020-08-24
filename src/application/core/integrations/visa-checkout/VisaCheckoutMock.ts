import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { VisaCheckout } from './VisaCheckout';

export class VisaCheckoutMock extends VisaCheckout {
  protected initPaymentConfiguration() {
    // Do nothing on mock because we don't want to use V.
  }

  protected paymentStatusHandler() {
    DomMethods.addListener(this.visaCheckoutButtonProps.id, 'click', () => {
      this._handleMockedData();
    });
  }

  private _handleMockedData() {
    return fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
      .then((response: any) => response.json())
      .then(({ payment, status }: any) => {
        this._proceedFlowWithMockedData(payment, status);
      });
  }

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

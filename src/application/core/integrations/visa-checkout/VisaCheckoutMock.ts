import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { VisaCheckout } from './VisaCheckout';
import { VisaButtonProps } from '../models/constants/visa-checkout/VisaButtonProps';

export class VisaCheckoutMock extends VisaCheckout {
  protected _instantiateVisa() {
    // Do nothing on mock because we don't want to use V.
  }

  protected paymentStatusHandler() {
    DomMethods.addListener(VisaButtonProps.id, 'click', () => {
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
      // @ts-ignore
      this._onSuccess(payment);
    } else if (status === 'ERROR') {
      // @ts-ignore
      this._onError();
    } else if (status === 'WARNING') {
      // @ts-ignore
      this._onCancel();
    }
  }
}

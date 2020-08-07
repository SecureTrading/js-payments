import { environment } from '../../../../environments/environment';

export class ApplePaySessionMock {
  public static STATUS_SUCCESS: any;
  public static STATUS_FAILURE: any = 'FAILURE';
  public static onvalidatemerchant: any;
  public static onpaymentauthorized: any;
  public static oncancel: any;

  public static completePayment = () => true;

  public static completeMerchantValidation = () => true;

  public static completePaymentMethodSelection = () => true;

  public static begin() {
    return fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        this._handleResponse(data);
      });
  }

  private static _handleResponse(data: any) {
    if (data.status === 'SUCCESS') {
      this.STATUS_SUCCESS = data.status;
      this.onpaymentauthorized(data);
    } else {
      this.STATUS_FAILURE = data.status;
      this.oncancel(data);
    }
    return data;
  }
}

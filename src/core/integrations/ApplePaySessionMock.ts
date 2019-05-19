import { environment } from '../../environments/environment';

export default class ApplePaySessionMock {
  public static STATUS_SUCCESS: any;
  public static onvalidatemerchant: any;
  public static onpaymentauthorized: any;
  public static oncancel: any;

  public static completeMerchantValidation = () => true;

  public static completePaymentMethodSelection = () => true;

  /**
   * Retrieves Apple Pay data from test endpoint
   * @private
   */
  public static begin() {
    return fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        this._handleResponse(data);
      });
  }

  public static completePayment = () => true;

  private static _handleResponse(data: any) {
    if (data.status === 'SUCCESS') {
      this.STATUS_SUCCESS = data.status;
      this.onpaymentauthorized(data);
    } else {
      this.oncancel(data);
    }
    return data;
  }
}

import { environment } from '../../environments/environment';
import { IMerchantData } from '../models/MerchantData';
import Payment from './Payment';

export default class PaymentMock extends Payment {
  public authorizePayment(payment: ICard | IWallet, merchantData: IMerchantData, additionalData?: any) {
    return fetch(environment.ST_URLS.MOCK.AUTH)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        return data;
      });
  }

  public threeDQueryRequest(card: ICard): Promise<object> {
    return fetch(environment.ST_URLS.MOCK.THREEDQUERY_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        return data;
      });
  }
}

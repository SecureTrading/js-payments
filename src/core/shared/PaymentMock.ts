import { environment } from '../../environments/environment';
import Payment from './Payment';

export default class PaymentMock extends Payment {
  public threeDQueryRequest(card: Card): Promise<object> {
    return fetch(environment.ST_URLS.MOCK.THREEDQUERY_URL)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        return data;
      });
  }
}

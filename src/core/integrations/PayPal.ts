import { environment } from '../../environments/environment';
import DomMethods from '../shared/DomMethods';

class PayPal {
  private _sdkAddress: string = environment.PAYPAL.TEST_SDK;

  constructor() {
    this._initFlow();
  }

  private _loadSdk() {
    return new Promise((resolve, reject) => {
      DomMethods.insertScript('body', this._sdkAddress).addEventListener('load', () => {
        resolve('Its ok');
        reject(new Error('An error occured'));
      });
    });
  }

  private _initFlow() {
    this._loadSdk()
      .then(response => {
        const script = document.createElement('script');
        // @ts-ignore
        script.innerHTML = `${paypal.Buttons().render('#st-paypal')}`;
        document.head.appendChild(script);
      })
      .then(() => {
        const script = document.createElement('script');
        // @ts-ignore
        script.innerHTML = `${paypal
          .Buttons({
            createOrder: (data: any, actions: any) => {
              // Set up the transaction
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      currency_code: 'USD',
                      value: '0.01'
                    }
                  }
                ]
              });
            }
          })
          .render('#st-paypal')}`;
        document.head.appendChild(script);
      })
      .catch(() => {
        console.error('Something is no yes');
      });
  }
}

export default PayPal;

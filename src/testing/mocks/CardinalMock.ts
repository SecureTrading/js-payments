import { ICardinal } from '../../application/core/integrations/cardinal-commerce/ICardinal';
import { PaymentEvents } from '../../application/core/models/constants/PaymentEvents';
import { ajaxGet } from 'rxjs/internal-compatibility';
import { environment } from '../../environments/environment';

export class CardinalMock implements ICardinal {
  private callbacks = {
    [PaymentEvents.SETUP_COMPLETE]: (...args: any[]): any => void 0,
    [PaymentEvents.VALIDATED]: (...args: any[]): any => void 0
  };

  configure(config: any) {
    // @ts-ignore
  }

  continue(paymentBrand: string, continueObject: any, orderObject?: any, cardinalJwt?: string) {
    ajaxGet(environment.CARDINAL_COMMERCE.MOCK.AUTHENTICATE_CARD_URL).subscribe(response => {
      const { data, jwt } = response.response;
      this.callbacks[PaymentEvents.VALIDATED](data, jwt);
    });
  }

  off(event: string) {
    // @ts-ignore
  }

  on(eventName: string, callback: (...eventData: any[]) => void) {
    this.callbacks[eventName] = callback;
  }

  setup(initializationType: 'init' | 'complete' | 'confirm', initializationData: any) {
    setTimeout(() => this.callbacks[PaymentEvents.SETUP_COMPLETE](), 100);
  }

  trigger(eventName: string, ...data: any[]) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].apply(this, data);
    }
  }
}

import { ICardinal } from '../../application/core/integrations/cardinal-commerce/ICardinal';
import { PaymentEvents } from '../../application/core/models/constants/PaymentEvents';
import { CardinalCommerce } from '../../application/core/integrations/cardinal-commerce/CardinalCommerce';
import { ajaxGet } from 'rxjs/internal-compatibility';
import { environment } from '../../environments/environment';

export class CardinalMock implements ICardinal {
  private callbacks = {
    [PaymentEvents.SETUP_COMPLETE]: () => void 0,
    [PaymentEvents.VALIDATED]: () => void 0,
    [CardinalCommerce.UI_EVENTS.RENDER]: () => void 0,
    [CardinalCommerce.UI_EVENTS.CLOSE]: () => void 0
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
    this.callbacks[PaymentEvents.SETUP_COMPLETE]();
  }

  trigger(eventName: string, data: any) {
    // @ts-ignore
  }
}

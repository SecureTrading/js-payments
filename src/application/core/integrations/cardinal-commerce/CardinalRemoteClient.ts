import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { from, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IInitializationData } from '../../../../shared/integrations/cardinal-commerce/IInitializationData';
import { PUBLIC_EVENTS } from '../../shared/EventTypes';
import { Selectors } from '../../shared/Selectors';
import { IContinueData } from '../../../../shared/integrations/cardinal-commerce/IContinueData';
import { ITriggerData } from '../../../../shared/integrations/cardinal-commerce/ITriggerData';
import { PaymentEvents } from '../../models/constants/PaymentEvents';
import { IValidationResult } from '../../../../shared/integrations/cardinal-commerce/IValidationResult';

@Service()
export class CardinalRemoteClient {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {}

  setup(jwt: string): Observable<void> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_SETUP,
      data: { jwt }
    };

    return from(this.interFrameCommunicator.query(queryEvent, Selectors.MERCHANT_PARENT_FRAME));
  }

  continue(data: IContinueData): Observable<IValidationResult> {
    const queryEvent: IMessageBusEvent<IInitializationData> = {
      type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
      data
    };

    return from(this.interFrameCommunicator.query(queryEvent, Selectors.MERCHANT_PARENT_FRAME));
  }

  binProcess(pan: string): Observable<void> {
    const queryEvent: IMessageBusEvent<ITriggerData<string>> = {
      type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
      data: {
        eventName: PaymentEvents.BIN_PROCESS,
        data: pan
      }
    };

    return from(this.interFrameCommunicator.query(queryEvent, Selectors.MERCHANT_PARENT_FRAME));
  }

  updateJwt(jwt: string): Observable<void> {
    const queryEvent: IMessageBusEvent<ITriggerData<string>> = {
      type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
      data: {
        eventName: PaymentEvents.JWT_UPDATE,
        data: jwt
      }
    };

    return from(this.interFrameCommunicator.query(queryEvent, Selectors.MERCHANT_PARENT_FRAME));
  }
}

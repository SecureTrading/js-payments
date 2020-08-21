import { IMessageSubscriber } from './interfaces/IMessageSubscriber';
import { MessageBus } from '../../../application/core/shared/MessageBus';
import { Service } from 'typedi';

@Service()
export class MessageSubscriberRegistry {
  constructor(private messageBus: MessageBus) {}

  register(...messageSubscribers: IMessageSubscriber[]): void {
    messageSubscribers.forEach(subscriber => subscriber.register(this.messageBus));
  }
}

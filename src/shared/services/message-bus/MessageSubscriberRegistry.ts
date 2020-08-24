import { IMessageSubscriber } from './interfaces/IMessageSubscriber';
import { Service } from 'typedi';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';

@Service()
export class MessageSubscriberRegistry {
  constructor(private messageBus: MessageBus) {}

  register(...messageSubscribers: IMessageSubscriber[]): void {
    messageSubscribers.forEach(subscriber => subscriber.register(this.messageBus));
  }
}

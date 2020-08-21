import { MessageBus } from '../../../../application/core/shared/MessageBus';

export interface IMessageSubscriber {
  register(messageBus: MessageBus): void;
}

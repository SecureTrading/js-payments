import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { Token } from 'typedi';

export const MessageSubscriberToken = new Token<IMessageSubscriber>();

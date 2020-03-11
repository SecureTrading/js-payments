import { IMessageBusEvent } from '../../../../backend/core/models/IMessageBusEvent';

export class ResponseMessage<T> implements IMessageBusEvent {
  static readonly MESSAGE_TYPE = 'ST_RESPONSE';
  readonly type = ResponseMessage.MESSAGE_TYPE;

  constructor(readonly data: T, readonly queryId: string, readonly queryFrame: string) {}
}

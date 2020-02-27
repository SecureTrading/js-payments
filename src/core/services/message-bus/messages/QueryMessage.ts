import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { Uuid } from '../../../shared/utils/Uuid';

export class QueryMessage implements IMessageBusEvent {
  static readonly MESSAGE_TYPE = 'ST_QUERY';
  readonly type = QueryMessage.MESSAGE_TYPE;
  readonly sourceFrame: string;
  readonly queryId: string;

  constructor(readonly data: IMessageBusEvent) {
    this.queryId = Uuid.uuidv4();
    this.sourceFrame = window.name;
  }
}

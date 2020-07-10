import { Store } from 'redux';
import { Observable } from 'rxjs';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';

export interface IControlFrameWindow extends Window {
  stStore?: Store;
  stMessages?: Observable<IMessageBusEvent>;
}

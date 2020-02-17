import { Observable } from 'rxjs';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { filter } from 'rxjs/operators';

export function ofType<T extends IMessageBusEvent>(type: string) {
  return (source: Observable<T>): Observable<T> => source.pipe(filter(event => event.type === type));
}

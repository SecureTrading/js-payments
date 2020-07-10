import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActionName, IAction } from '../IAction';

export function ofType<T extends ActionName>(type: T) {
  return (source: Observable<IAction<T>>): Observable<IAction<T>> => source.pipe(filter(event => event.type === type));
}

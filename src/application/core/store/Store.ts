import { Service } from 'typedi';
import { StoreAccessor } from './StoreAccessor';
import { Observable } from 'rxjs';
import { IState } from './IState';
import { map, shareReplay } from 'rxjs/operators';
import { PartialObserver, Unsubscribable } from 'rxjs/src/internal/types';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IAction } from './IAction';
import { Store as ReduxStore } from 'redux';
import { IActionsMap } from './IActionsMap';

@Service()
export class Store {
  private readonly state$: Observable<IState>;

  constructor(private storeAccessor: StoreAccessor) {
    this.state$ = new Observable(observer => {
      observer.next(this.store.getState());

      return this.store.subscribe(() => {
        observer.next(this.store.getState());
      });
    }).pipe(shareReplay(1));
  }

  dispatch<T extends keyof IActionsMap>(action: IAction<T>): void {
    this.store.dispatch(action);
  }

  select$<T>(selector: (state: IState) => T): Observable<T> {
    return this.state$.pipe(map(selector));
  }

  subscribe<T>(observer?: PartialObserver<IMessageBusEvent<T>>): Unsubscribable;

  subscribe<T>(
    next?: (value: IMessageBusEvent<T>) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Unsubscribable;

  subscribe(...args: any[]): Unsubscribable {
    return this.state$.subscribe.apply(this.state$, args);
  }

  private get store(): ReduxStore {
    return this.storeAccessor.getStore();
  }
}

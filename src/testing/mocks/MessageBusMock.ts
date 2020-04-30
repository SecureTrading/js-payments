import { Observable, Subject, Subscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Unsubscribable } from 'rxjs/src/internal/types';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { ofType } from '../../shared/services/message-bus/operators/ofType';

export class MessageBusMock implements Subscribable<IMessageBusEvent> {
  private readonly source: Subject<IMessageBusEvent>;
  public readonly pipe: Observable<any>['pipe'];

  constructor() {
    this.source = new Subject<IMessageBusEvent>();
    this.pipe = this.source.pipe.bind(this.source);
  }

  public publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void {
    this.source.next(event);
  }

  public subscribe<T>(...args: any[]): Unsubscribable {
    if (typeof args[0] === 'string' && typeof args[1] === 'function') {
      const [eventType, callback] = args;

      return this.source
        .pipe(
          ofType(eventType),
          map((event: IMessageBusEvent<T>) => event.data)
        )
        .subscribe(callback);
    }

    return this.source.subscribe.apply(this.source, args);
  }
}

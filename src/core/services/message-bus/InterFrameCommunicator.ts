import { Service } from 'typedi';
import { fromEventPattern, Observable, Subject } from 'rxjs';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { filter, map, share, switchMap, take, takeUntil } from 'rxjs/operators';
import { ofType } from './operators/ofType';
import { QueryMessage } from './messages/QueryMessage';
import { ResponseMessage } from './messages/ResponseMessage';

@Service()
export class InterFrameCommunicator {
  private static readonly MESSAGE_EVENT = 'message';
  public readonly incomingEvent$: Observable<IMessageBusEvent>;
  private destroy$ = new Subject<void>();

  constructor() {
    this.incomingEvent$ = fromEventPattern(
      handler => window.addEventListener(InterFrameCommunicator.MESSAGE_EVENT, handler, true),
      handler => window.removeEventListener(InterFrameCommunicator.MESSAGE_EVENT, handler)
    ).pipe(
      filter(event => event.data.type),
      map(event => event.data),
      share(),
    );
  }

  public send(message: IMessageBusEvent, target?: Window | string): void {
    const targetFrame = this.resolveTargetFrame(target);

    targetFrame.postMessage(message, targetFrame.origin);
  }

  public query<T>(message: IMessageBusEvent, target?: Window | string): Promise<T> {
    return new Promise((resolve, reject) => {
      const query = new QueryMessage(message);

      this.incomingEvent$.pipe(
        ofType(ResponseMessage.MESSAGE_TYPE),
        filter((event: ResponseMessage<T>) => event.queryId === query.queryId),
        map((event: ResponseMessage<T>) => event.data),
        take(1),
      ).subscribe({
        next(result) { resolve(result); },
        error(error) { reject(error); },
      });

      this.send(query, target);
    });
  }

  public whenReceive(eventType: string) {
    return {
      thenRespond: <T>(responder: (queryEvent: IMessageBusEvent) => Observable<T>) => {
        this.incomingEvent$.pipe(
          ofType(QueryMessage.MESSAGE_TYPE),
          filter((queryEvent: QueryMessage) => queryEvent.data.type === eventType),
          switchMap((queryEvent: QueryMessage) => responder(queryEvent.data).pipe(
            map((response: T) => new ResponseMessage(
              response,
              queryEvent.queryId,
              queryEvent.sourceFrame,
            )),
          )),
          takeUntil(this.destroy$),
        ).subscribe((response: ResponseMessage<T>) => {
          this.send(response, response.queryFrame);
        });
      }
    };
  }

  public destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resolveTargetFrame(target?: Window | string): Window {
    if (target instanceof Window) {
      return target;
    }

    if (typeof(target) === 'string' && target !== '') {
      if (!window.top.frames[target]) {
        throw new Error(`Target frame ${target} not found.`);
      }

      return window.top.frames[target];
    }

    return window.top;
  }
}

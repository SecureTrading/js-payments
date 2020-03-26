import { Container, Inject, Service } from 'typedi';
import { fromEventPattern, Observable, Subject } from 'rxjs';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { filter, map, share, switchMap, take, takeUntil } from 'rxjs/operators';
import { ofType } from './operators/ofType';
import { QueryMessage } from './messages/QueryMessage';
import { ResponseMessage } from './messages/ResponseMessage';
import { environment } from '../../../environments/environment';
import { FrameCollection } from './interfaces/FrameCollection';
import { Selectors } from '../../shared/Selectors';
import { CONFIG } from '../../dependency-injection/InjectionTokens';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameAccessor } from './FrameAccessor';

@Service()
export class InterFrameCommunicator {
  private static readonly MESSAGE_EVENT = 'message';
  private static readonly DEFAULT_ORIGIN = '*';
  public readonly incomingEvent$: Observable<IMessageBusEvent>;
  public readonly communicationClosed$: Observable<void>;
  private readonly close$ = new Subject<void>();
  private readonly frameOrigin: string;
  private parentOrigin: string;

  constructor(private identifier: FrameIdentifier, private frameAccessor: FrameAccessor) {
    this.incomingEvent$ = fromEventPattern<MessageEvent>(
      handler => window.addEventListener(InterFrameCommunicator.MESSAGE_EVENT, handler, true),
      handler => window.removeEventListener(InterFrameCommunicator.MESSAGE_EVENT, handler)
    ).pipe(
      filter(event => event.data.type),
      map(event => event.data),
      share()
    );

    this.communicationClosed$ = this.close$.asObservable();
    this.frameOrigin = new URL(environment.FRAME_URL).origin;
  }

  public send(message: IMessageBusEvent, target: Window | string): void {
    const parentFrame = this.frameAccessor.getParentFrame();
    const targetFrame = this.resolveTargetFrame(target);
    const frameOrigin = targetFrame === parentFrame ? this.getParentOrigin() : this.frameOrigin;

    targetFrame.postMessage(message, frameOrigin);
  }

  public query<T>(message: IMessageBusEvent, target: Window | string): Promise<T> {
    return new Promise((resolve, reject) => {
      const sourceFrame = this.identifier.getFrameName() || Selectors.MERCHANT_PARENT_FRAME;
      const query = new QueryMessage(message, sourceFrame);

      this.incomingEvent$
        .pipe(
          ofType(ResponseMessage.MESSAGE_TYPE),
          filter((event: ResponseMessage<T>) => event.queryId === query.queryId),
          map((event: ResponseMessage<T>) => event.data),
          take(1)
        )
        .subscribe({
          next(result) {
            resolve(result);
          },
          error(error) {
            reject(error);
          }
        });

      this.send(query, target);
    });
  }

  public whenReceive(eventType: string) {
    return {
      thenRespond: <T>(responder: (queryEvent: IMessageBusEvent) => Observable<T>) => {
        this.incomingEvent$
          .pipe(
            ofType(QueryMessage.MESSAGE_TYPE),
            filter((queryEvent: QueryMessage) => queryEvent.data.type === eventType),
            switchMap((queryEvent: QueryMessage) =>
              responder(queryEvent.data).pipe(
                take(1),
                map((response: T) => new ResponseMessage(response, queryEvent.queryId, queryEvent.sourceFrame))
              )
            ),
            takeUntil(this.close$)
          )
          .subscribe((response: ResponseMessage<T>) => {
            this.send(response, response.queryFrame);
          });
      }
    };
  }

  public close(): void {
    this.close$.next();
    this.close$.complete();
  }

  private resolveTargetFrame(target: Window | string): Window {
    if (target instanceof Window) {
      return target;
    }

    if (target === Selectors.MERCHANT_PARENT_FRAME) {
      return this.frameAccessor.getParentFrame();
    }

    const frames: FrameCollection = this.frameAccessor.getFrameCollection();

    if (target === '' || !frames[target]) {
      throw new Error(`Target frame "${target}" not found.`);
    }

    return frames[target];
  }

  private getParentOrigin(): string {
    if (this.parentOrigin) {
      return this.parentOrigin;
    }

    if (Container.has(CONFIG)) {
      this.parentOrigin = Container.get(CONFIG).origin || InterFrameCommunicator.DEFAULT_ORIGIN;

      return this.parentOrigin;
    }

    return InterFrameCommunicator.DEFAULT_ORIGIN;
  }
}

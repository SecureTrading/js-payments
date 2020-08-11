import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Service } from 'typedi';
import { Observable, Subscribable } from 'rxjs';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { map, switchMap } from 'rxjs/operators';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../models/constants/Selectors';
import { PartialObserver, Unsubscribable } from 'rxjs/src/internal/types';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { FrameCollection } from '../../../../shared/services/message-bus/interfaces/FrameCollection';
import { FrameIdentifier } from '../../../../shared/services/message-bus/FrameIdentifier';
import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../models/constants/EventTypes';

type ControlFrameWindow = Window & { stMessages: Observable<IMessageBusEvent> };

@Service()
export class MessageBus implements Subscribable<IMessageBusEvent> {
  public static EVENTS = PRIVATE_EVENTS;
  public static EVENTS_PUBLIC = PUBLIC_EVENTS;
  public readonly pipe: Observable<any>['pipe'];
  private readonly messageStream$: Observable<IMessageBusEvent>;

  constructor(
    private communicator: InterFrameCommunicator,
    private framesHub: FramesHub,
    private identifier: FrameIdentifier,
    private frameAccessor: FrameAccessor
  ) {
    this.messageStream$ = this.getMessageStream();
    this.pipe = this.messageStream$.pipe.bind(this.messageStream$);

    if (this.identifier.isControlFrame()) {
      ((window as unknown) as ControlFrameWindow).stMessages = this.messageStream$;
    }
  }

  public publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void {
    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(controlFrame => {
      try {
        this.communicator.send(event, controlFrame);
      } catch (e) {
        console.warn(`Cannot send event to ControlFrame. ${e}`);
      }
    });

    if (publishToParent) {
      this.publishToParent(event);
    }
  }

  public subscribe<T>(observer?: PartialObserver<IMessageBusEvent<T>>): Unsubscribable;

  public subscribe<T>(
    next?: (value: IMessageBusEvent<T>) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Unsubscribable;

  /** @deprecated use RxJS implementation instead */
  public subscribe<T>(eventType: string, callback: (data: T) => void): Unsubscribable;

  public subscribe<T>(...args: any[]): Unsubscribable {
    if (typeof args[0] === 'string' && typeof args[1] === 'function') {
      const [eventType, callback] = args;

      return this.messageStream$
        .pipe(
          ofType(eventType),
          map((event: IMessageBusEvent<T>) => event.data)
        )
        .subscribe(callback);
    }

    return this.messageStream$.subscribe.apply(this.messageStream$, args);
  }

  private publishToParent<T>(event: IMessageBusEvent<T>): void {
    if (!Object.values(MessageBus.EVENTS_PUBLIC).includes(event.type)) {
      throw new Error(`Cannot publish private event "${event.type}" to parent frame.`);
    }

    this.communicator.send(event, MERCHANT_PARENT_FRAME);
  }

  private getMessageStream(): Observable<IMessageBusEvent> {
    if (this.identifier.isParentFrame() || this.identifier.isControlFrame()) {
      return this.communicator.incomingEvent$;
    }

    return this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).pipe(
      switchMap(frameName => {
        const frames: FrameCollection = this.frameAccessor.getFrameCollection();
        const controlFrame: ControlFrameWindow = frames[frameName] as ControlFrameWindow;

        return new Observable<IMessageBusEvent>(subscriber => {
          controlFrame.stMessages.subscribe(value => subscriber.next(value));
        });
      })
    );
  }
}

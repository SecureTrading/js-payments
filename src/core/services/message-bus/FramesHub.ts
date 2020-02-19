import { Service } from 'typedi';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { iif, Observable, of, throwError } from 'rxjs';
import { ofType } from './operators/ofType';
import { MessageBus } from '../../shared/MessageBus';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';

@Service()
export class FramesHub {
  public readonly activeFrame$: Observable<string[]>;

  constructor(private communicator: InterFrameCommunicator) {
    this.activeFrame$ = this.communicator.incomingEvent$.pipe(
      ofType(MessageBus.EVENTS_PUBLIC.FRAME_READY),
      filter((event: IMessageBusEvent) => Boolean(event.data)),
      scan(this.onFrameReady.bind(this), []),
      startWith([]),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.communicator
      .whenReceive(MessageBus.EVENTS_PUBLIC.GET_ACTIVE_FRAMES)
      .thenRespond(() => this.activeFrame$);
  }

  public init(): void {
    this.activeFrame$
      .pipe(takeUntil(this.communicator.communicationClosed$))
      .subscribe();
  }

  public isFrameActive(name: string): Observable<boolean> {
    return this.activeFrame$.pipe(
      map(frames => frames.indexOf(name) !== -1),
      distinctUntilChanged(),
    );
  }

  public getFrame(name: string): Observable<Window> {
    return this.isFrameActive(name).pipe(
      filter(Boolean),
      switchMap(() => iif(
        // @ts-ignore
        () => Boolean(window.top.frames[name]),
        // @ts-ignore
        of(window.top.frames[name]),
        throwError(`Frame ${name} not found.`),
      )),
      first(),
    );
  }

  public notifyReadyState(): void {
    if (!window.name) {
      // @todo: Validation class should not extend Frame class. Once fixed this line should throw an error */
      console.warn('Cannot set ready state for frame without name.');

      return;
    }

    this.communicator.send({type: MessageBus.EVENTS_PUBLIC.FRAME_READY, data: window.name});
  }

  private onFrameReady(activeFrames: string[], event: IMessageBusEvent): string[] {
    if (activeFrames.indexOf(event.data) !== -1) {
      return activeFrames;
    }

    activeFrames = [...activeFrames, event.data];

    if (window.self === window.top) {
      activeFrames.forEach(frame => this.communicator.send(event, frame));
    }

    return activeFrames;
  }
}

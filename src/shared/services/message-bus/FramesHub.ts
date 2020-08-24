import { Service } from 'typedi';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import { ofType } from './operators/ofType';
import { distinctUntilChanged, filter, first, map, mapTo, withLatestFrom } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { FrameIdentifier } from './FrameIdentifier';
import { ArrayUtils } from '../../../application/core/shared/array-utils/ArrayUtils';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';

@Service()
export class FramesHub {
  private static readonly FRAME_READY_EVENT = 'ST_FRAME_READY';
  private static readonly GET_FRAMES_EVENT = 'ST_GET_ACTIVE_FRAMES';
  private activeFrame$: Subject<string[]> = new BehaviorSubject([]);

  constructor(private communicator: InterFrameCommunicator, private identifier: FrameIdentifier) {
    this.communicator.whenReceive(FramesHub.GET_FRAMES_EVENT).thenRespond(() => this.activeFrame$);

    this.getInitialFrames().subscribe(value => this.activeFrame$.next(value));

    const fromEventFrame$ = this.communicator.incomingEvent$.pipe(
      ofType(FramesHub.FRAME_READY_EVENT),
      filter((event: IMessageBusEvent) => Boolean(event.data)),
      map((event: IMessageBusEvent) => event.data)
    );

    fromEventFrame$
      .pipe(
        withLatestFrom(this.activeFrame$),
        map(([newFrame, activeFrames]) => ArrayUtils.unique([...activeFrames, newFrame]))
      )
      .subscribe(this.activeFrame$);

    fromEventFrame$
      .pipe(withLatestFrom(this.activeFrame$))
      .subscribe(([newFrame, activeFrames]) => this.onFrameReady(newFrame, activeFrames));

    this.communicator.incomingEvent$
      .pipe(ofType(PUBLIC_EVENTS.DESTROY), mapTo([]))
      .subscribe(value => this.activeFrame$.next(value));
  }

  public isFrameActive(name: string): Observable<boolean> {
    return this.activeFrame$.pipe(
      map(frames => frames.indexOf(name) !== -1),
      distinctUntilChanged()
    );
  }

  public waitForFrame(name: string): Observable<string> {
    return this.isFrameActive(name).pipe(filter(Boolean), first(), mapTo(name));
  }

  public notifyReadyState(): void {
    const frameName = this.identifier.getFrameName();

    if (frameName === MERCHANT_PARENT_FRAME) {
      return;
    }

    this.communicator.send({ type: FramesHub.FRAME_READY_EVENT, data: frameName }, MERCHANT_PARENT_FRAME);
  }

  public getParentFrame(): Window {
    if (this.identifier.isParentFrame()) {
      return window;
    }

    return window.parent;
  }

  private getInitialFrames(): Observable<string[]> {
    if (this.identifier.isParentFrame()) {
      return of([]);
    }

    return from(this.communicator.query<string[]>({ type: FramesHub.GET_FRAMES_EVENT }, MERCHANT_PARENT_FRAME));
  }

  private onFrameReady(newFrame: string, activeFrames: string[]): void {
    if (!this.identifier.isParentFrame()) {
      return;
    }

    const event: IMessageBusEvent = {
      type: FramesHub.FRAME_READY_EVENT,
      data: newFrame
    };

    activeFrames.forEach(frame => this.communicator.send(event, frame));
  }
}

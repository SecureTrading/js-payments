import { Service } from 'typedi';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { concat, from, Observable } from 'rxjs';
import { ofType } from './operators/ofType';
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { ArrayUtils } from '../../../application/core/shared/utils/ArrayUtils';
import { Selectors } from '../../../application/core/shared/Selectors';
import { FrameIdentifier } from './FrameIdentifier';

@Service()
export class FramesHub {
  private static readonly FRAME_READY_EVENT = 'ST_FRAME_READY';
  private static readonly GET_FRAMES_EVENT = 'ST_GET_ACTIVE_FRAMES';
  public readonly activeFrame$: Observable<string[]>;

  constructor(private communicator: InterFrameCommunicator, private identifier: FrameIdentifier) {
    const initialFrames$ = this.getInitialFrames();
    const fromEventFrame$ = this.communicator.incomingEvent$.pipe(
      ofType(FramesHub.FRAME_READY_EVENT),
      filter((event: IMessageBusEvent) => Boolean(event.data)),
      map((event: IMessageBusEvent) => event.data),
      shareReplay()
    );

    this.activeFrame$ = concat(initialFrames$, fromEventFrame$).pipe(
      scan((activeFrames, newFrame) => [...activeFrames, newFrame], []),
      map(frames => ArrayUtils.unique(frames)),
      distinctUntilChanged((prev, curr) => ArrayUtils.equals(prev, curr)),
      shareReplay(1)
    );

    this.communicator.whenReceive(FramesHub.GET_FRAMES_EVENT).thenRespond(() => this.activeFrame$);

    fromEventFrame$
      .pipe(withLatestFrom(this.activeFrame$), takeUntil(this.communicator.communicationClosed$))
      .subscribe(([newFrame, activeFrames]) => this.onFrameReady(newFrame, activeFrames));
  }

  public isFrameActive(name: string): Observable<boolean> {
    return this.activeFrame$.pipe(
      map(frames => frames.indexOf(name) !== -1),
      distinctUntilChanged()
    );
  }

  public waitForFrame(name: string): Observable<string> {
    return this.isFrameActive(name).pipe(filter(Boolean), mapTo(name));
  }

  public notifyReadyState(): void {
    const frameName = this.identifier.getFrameName();
    console.error(frameName);
    if (frameName === Selectors.MERCHANT_PARENT_FRAME) {
      return;
    }

    if (!frameName) {
      // @todo: Validation class should not extend Frame class. Once fixed this line should throw an error */
      console.warn('Cannot set ready state for frame without name.');

      return;
    }

    this.communicator.send({ type: FramesHub.FRAME_READY_EVENT, data: frameName }, Selectors.MERCHANT_PARENT_FRAME);
  }

  public getParentFrame(): Window {
    if (this.identifier.isParentFrame()) {
      return window;
    }

    return window.parent;
  }

  private getInitialFrames(): Observable<string> {
    if (this.identifier.isParentFrame()) {
      return from([]);
    }

    return from(this.communicator.query({ type: FramesHub.GET_FRAMES_EVENT }, Selectors.MERCHANT_PARENT_FRAME)).pipe(
      switchMap((frames: string[]) => from(frames))
    );
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

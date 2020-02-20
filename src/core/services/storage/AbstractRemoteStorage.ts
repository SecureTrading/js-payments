import { Service } from 'typedi';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';
import { from, Observable } from 'rxjs';
import { Selectors } from '../../shared/Selectors';
import { switchMap } from 'rxjs/operators';

@Service()
export abstract class AbstractRemoteStorage {
  protected constructor(
    private communicator: InterFrameCommunicator,
    private framesHub: FramesHub,
  ) {
  }

  public getItem(key: string): Observable<string> {
    const message: IMessageBusEvent = {
      type: this.messageTypes.get,
      data: key,
    };

    return this.framesHub.waitForFrame(Selectors.CONTROL_FRAME_IFRAME).pipe(
      switchMap(controlFrame => from(this.communicator.query(message, controlFrame))),
    );
  }

  public setItem(key: string, value: string): void {
    this.framesHub
      .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
      .subscribe(controlFrame => {
        const message: IMessageBusEvent = {
          type: this.messageTypes.set,
          data: {key, value},
        };

        this.communicator.send(message, controlFrame);
      });
  }

  protected abstract get messageTypes(): {get: string, set: string};
}

import { Service } from 'typedi';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ofType } from '../message-bus/operators/ofType';
import { IStorage } from './IStorage';
import { ISynchronizedStorage } from './ISynchronizedStorage';

interface StorageData {
  [index: string]: any;
}

@Service()
export class ParentFrameStorage implements IStorage, ISynchronizedStorage {
  private storage$: BehaviorSubject<StorageData> = new BehaviorSubject({});

  constructor(private interFrameCommunicator: InterFrameCommunicator, private framesHub: FramesHub) {}

  getItem(name: string): any {
    return this.storage$.getValue()[name];
  }

  setItem(name: string, value: any): void {
    this.setItemWithoutSync(name, value);
    this.framesHub.waitForFrame(CONTROL_FRAME_IFRAME).subscribe(controlFrame => {
      this.interFrameCommunicator.send(
        {
          type: PUBLIC_EVENTS.STORAGE_SYNC,
          data: { key: name, value: JSON.stringify(value) }
        },
        controlFrame
      );
    });
  }

  select<T>(selector: (storage: { [p: string]: any }) => T): Observable<T> {
    return this.storage$.pipe(map(selector));
  }

  initSynchronization(): void {
    this.interFrameCommunicator.incomingEvent$
      .pipe(ofType(PUBLIC_EVENTS.STORAGE_SYNC), takeUntil(this.interFrameCommunicator.communicationClosed$))
      .subscribe(event => {
        const { key, value } = event.data;
        this.setItemWithoutSync(key, this.parseEventData(value));
      });
  }

  private setItemWithoutSync(name: string, value: any): void {
    const storage = this.storage$.getValue();
    this.storage$.next({ ...storage, [name]: value });
  }

  private parseEventData(jsonData: string): any {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      return undefined;
    }
  }
}

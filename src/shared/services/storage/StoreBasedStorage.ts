import { Observable } from 'rxjs';
import { Store } from '../../../application/core/store/Store';
import { Service } from 'typedi';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ofType } from '../message-bus/operators/ofType';
import { IStorage } from './IStorage';
import { ISynchronizedStorage } from './ISynchronizedStorage';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';

@Service()
export class StoreBasedStorage implements IStorage, ISynchronizedStorage {
  constructor(private store: Store, private interFrameCommunicator: InterFrameCommunicator) {}

  getItem(name: string): any {
    const { storage } = this.store.getState();

    return storage[name];
  }

  setItem(name: string, value: any): void {
    this.setItemWithoutSync(name, value);
    this.interFrameCommunicator.send(
      {
        type: PUBLIC_EVENTS.STORAGE_SYNC,
        data: { key: name, value: JSON.stringify(value) }
      },
      MERCHANT_PARENT_FRAME
    );
  }

  select<T>(selector: (storage: { [p: string]: any }) => T): Observable<T> {
    return this.store.select$(state => selector(state.storage));
  }

  initSynchronization() {
    this.interFrameCommunicator.incomingEvent$.pipe(ofType(PUBLIC_EVENTS.STORAGE_SYNC)).subscribe(event => {
      const { key, value } = event.data;
      this.setItemWithoutSync(key, this.parseEventData(value));
    });
  }

  private setItemWithoutSync(name: string, value: string): void {
    this.store.dispatch({
      type: 'STORAGE/SET_ITEM',
      payload: { key: name, value }
    });
  }

  private parseEventData(jsonData: string): any {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      return undefined;
    }
  }
}

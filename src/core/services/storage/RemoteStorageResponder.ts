import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { BrowserSessionStorage } from './BrowserSessionStorage';
import { BrowserLocalStorage } from './BrowserLocalStorage';
import { StorageEvents } from './StorageEvents';
import { of } from 'rxjs';
import { Service } from 'typedi';
import { ofType } from '../message-bus/operators/ofType';
import { takeUntil } from 'rxjs/operators';

@Service()
export class RemoteStorageEventHandler {
  constructor(
    private localStorage: BrowserLocalStorage,
    private sessionStorage: BrowserSessionStorage,
    private communicator: InterFrameCommunicator
  ) {
  }

  init(): void {
    this.communicator
      .whenReceive(StorageEvents.GET_LOCAL_STORAGE_ITEM)
      .thenRespond(event => of(this.localStorage.getItem(event.data)));

    this.communicator
      .whenReceive(StorageEvents.GET_SESSION_STORAGE_ITEM)
      .thenRespond(event => of(this.sessionStorage.getItem(event.data)));

    this.communicator.incomingEvent$.pipe(
      ofType(StorageEvents.SET_LOCAL_STORAGE_ITEM),
      takeUntil(this.communicator.communicationClosed$)
    ).subscribe(event => this.localStorage.setItem(event.data.key, event.data.value));

    this.communicator.incomingEvent$.pipe(
      ofType(StorageEvents.SET_SESSION_STORAGE_ITEM),
      takeUntil(this.communicator.communicationClosed$)
    ).subscribe(event => this.sessionStorage.setItem(event.data.key, event.data.value));
  }
}

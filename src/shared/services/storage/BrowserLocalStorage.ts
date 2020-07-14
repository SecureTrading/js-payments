import { Container, Service } from 'typedi';
import { FrameIdentifier } from '../message-bus/FrameIdentifier';
import { ParentFrameStorage } from './ParentFrameStorage';
import { StoreBasedStorage } from './StoreBasedStorage';
import { IStorage } from './IStorage';
import { Observable } from 'rxjs';
import { isSynchronized } from './ISynchronizedStorage';

@Service()
export class BrowserLocalStorage implements IStorage {
  private readonly storage: IStorage;

  constructor(private identifier: FrameIdentifier) {
    this.storage = identifier.isParentFrame() ? Container.get(ParentFrameStorage) : Container.get(StoreBasedStorage);
  }

  init(): void {
    if (isSynchronized(this.storage)) {
      this.storage.initSynchronization();
    }
  }

  getItem(name: string): any {
    return this.storage.getItem(name);
  }

  setItem(name: string, value: any): void {
    this.storage.setItem(name, value);
  }

  select<T>(selector: (storage: { [p: string]: any }) => T): Observable<T> {
    return this.storage.select(selector);
  }
}

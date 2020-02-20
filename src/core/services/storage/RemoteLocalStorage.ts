import { AbstractRemoteStorage } from './AbstractRemoteStorage';
import { StorageEvents } from './StorageEvents';
import { Service } from 'typedi';

@Service()
export class RemoteLocalStorage extends AbstractRemoteStorage {
  protected get messageTypes(): { get: string; set: string } {
    return {
      get: StorageEvents.GET_LOCAL_STORAGE_ITEM,
      set: StorageEvents.SET_LOCAL_STORAGE_ITEM,
    };
  }
}

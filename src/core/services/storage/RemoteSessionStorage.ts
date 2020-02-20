import { AbstractRemoteStorage } from './AbstractRemoteStorage';
import { StorageEvents } from './StorageEvents';
import { Service } from 'typedi';

@Service()
export class RemoteSessionStorage extends AbstractRemoteStorage {
  protected get messageTypes(): { get: string; set: string } {
    return {
      get: StorageEvents.GET_SESSION_STORAGE_ITEM,
      set: StorageEvents.SET_SESSION_STORAGE_ITEM,
    };
  }
}

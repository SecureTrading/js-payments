import { IStorage } from '../../models/IStorage';
import { MessageBus } from '../../shared/MessageBus';
import { StorageItemEvent } from './StorageItemEvent';

export class ParentLocalStorage implements IStorage {
  readonly ready: Promise<void> = Promise.resolve();
  private _frames: string[] = [];

  constructor(
    private readonly _storage: Storage,
    private readonly _messageBus: MessageBus
  ) {
    this._messageBus.subscribeOnParent(MessageBus.EVENTS.STORAGE_COMPONENT_READY, (frameName: string) => {
      this._frames.push(frameName);
      this.synchronizeStorage(frameName);
    });

    this._messageBus.subscribeOnParent(MessageBus.EVENTS.STORAGE_SET_ITEM, (item: StorageItemEvent) => {
      this.setItem(item.name, item.value);
    });
  }

  public getItem(name: string): string {
    return this._storage.getItem(name);
  }

  public setItem(name: string, value: string): void {
    this._storage.setItem(name, value);
    this.synchronizeStorage();
  }

  private synchronizeStorage(frameName?: string): void {
    const componentFrames = frameName ? [frameName] : this._frames;

    componentFrames.forEach((frame: string) => {
      this._messageBus.publishFromParent({
        type: MessageBus.EVENTS.STORAGE_SYNCHRONIZE,
        data: {...this._storage},
      }, frame);
    });
  }
}

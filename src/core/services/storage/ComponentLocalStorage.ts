import { IStorage } from '../../models/IStorage';
import { MessageBus } from '../../shared/MessageBus';

export class ComponentLocalStorage implements IStorage {
  readonly ready: Promise<void>;
  private static _initialized = false;
  private readonly _storage: Storage;
  private readonly _messageBus: MessageBus;

  constructor() {
    this._storage = localStorage;
    this._messageBus = new MessageBus();

    if (ComponentLocalStorage._initialized) {
      this.ready = Promise.resolve();
      return;
    }

    ComponentLocalStorage._initialized = true;

    this.ready = new Promise(resolve => {
      window.addEventListener('message', (event: MessageEvent) => {
        const {type, data} = event.data;

        if (type === MessageBus.EVENTS.STORAGE_SYNCHRONIZE) {
          Object.keys(data).forEach(key => this._storage.setItem(key, data[key]));
        }

        resolve();
      });
    });

    this._messageBus.publish({type: MessageBus.EVENTS.STORAGE_COMPONENT_READY, data: window.name}, true);
  }

  public getItem(name: string): string {
    return this._storage.getItem(name);
  }

  public setItem(name: string, value: string): void {
    this._messageBus.publish({
      type: MessageBus.EVENTS.STORAGE_SET_ITEM,
      data: {name, value},
    }, true);
  }
}

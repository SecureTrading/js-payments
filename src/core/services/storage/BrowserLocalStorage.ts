import { ComponentLocalStorage } from './ComponentLocalStorage';
import { ParentLocalStorage } from './ParentLocalStorage';
import { IStorage } from '../../models/IStorage';

export class BrowserLocalStorage implements IStorage {
  readonly ready: Promise<void>;
  private readonly _storage: IStorage;

  constructor() {
    const _isInsideComponent: boolean = (window.top !== window.self);

    this._storage = _isInsideComponent ?
      new ComponentLocalStorage() :
      new ParentLocalStorage();

    this.ready = this._storage.ready;
  }

  public getItem(name: string): string {
    return this._storage.getItem(name);
  }

  public setItem(name: string, value: string): void {
    this._storage.setItem(name, value);
  }
}

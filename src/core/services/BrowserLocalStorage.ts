import { IStorage } from '../models/IStorage';

export class BrowserLocalStorage implements IStorage {
  private readonly _storage: Storage;

  constructor() {
    this._storage = localStorage;
  }

  public getItem(name: string): string {
    return this._storage.getItem(name);
  }

  public setItem(name: string, value: string): void {
    return this._storage.setItem(name, value);
  }
}

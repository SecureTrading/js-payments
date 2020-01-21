import { IStorage } from '../models/IStorage';

export class BrowserLocalStorage implements IStorage {
  private readonly _storage: Storage;

  constructor() {
    this._storage = localStorage;
  }

  public getItem(name: string): string {
    try {
      return this._storage.getItem(name);
    } catch (e) {
      throw new Error(e);
    }
  }

  public setItem(name: string, value: string): void {
    try {
      return this._storage.setItem(name, value);
    } catch (e) {
      throw new Error(e);
    }
  }
}

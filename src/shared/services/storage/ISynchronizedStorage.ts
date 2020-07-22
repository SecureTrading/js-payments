import { IStorage } from './IStorage';

export interface ISynchronizedStorage extends IStorage {
  initSynchronization(): void;
}

export function isSynchronized(storage: IStorage): storage is ISynchronizedStorage {
  return typeof (storage as any).initSynchronization === 'function';
}

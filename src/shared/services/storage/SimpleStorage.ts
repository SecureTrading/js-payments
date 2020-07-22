import { Service } from 'typedi';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IStorage } from './IStorage';

interface StorageData {
  [index: string]: any;
}

@Service()
export class SimpleStorage implements IStorage {
  private storage$: BehaviorSubject<StorageData> = new BehaviorSubject({});

  getItem(name: string): any {
    return this.storage$.getValue()[name];
  }

  setItem(name: string, value: any): void {
    const storage = this.storage$.getValue();
    this.storage$.next({ ...storage, [name]: value });
  }

  select<T>(selector: (storage: { [p: string]: any }) => T): Observable<T> {
    return this.storage$.pipe(map(selector));
  }
}

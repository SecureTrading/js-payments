import { Observable } from 'rxjs';

export interface IStorage {
  getItem(name: string): any;
  setItem(name: string, value: any): void;
  select<T>(selector: (storage: { [key: string]: any }) => T): Observable<T>;
}

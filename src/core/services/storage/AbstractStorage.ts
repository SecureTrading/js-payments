import { IStorage } from '../../models/IStorage';
import { fromEventPattern, Observable, Subscribable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

export abstract class AbstractStorage implements IStorage, Subscribable<any> {
  private static readonly STORAGE_EVENT = 'storage';
  public readonly pipe: Observable<any>['pipe'];
  public readonly subscribe: Observable<any>['subscribe'];
  private readonly observable$: Observable<any>;

  protected constructor(private nativeStorage: Storage) {
    this.observable$ = fromEventPattern(
      handler => window.addEventListener(AbstractStorage.STORAGE_EVENT, handler, true),
      handler => window.removeEventListener(AbstractStorage.STORAGE_EVENT, handler)
    ).pipe(
      startWith({...this.nativeStorage}),
      map(() => ({...this.nativeStorage})),
      shareReplay(1),
    );
    this.pipe = this.observable$.pipe.bind(this.observable$);
    this.subscribe = this.observable$.subscribe.bind(this.observable$);
  }

  public getItem(name: string): string {
    return this.nativeStorage.getItem(name);
  }

  public setItem(name: string, value: string): void {
    this.nativeStorage.setItem(name, value);
    this.emitStorageEvent();
  }

  public select<T>(selector: ((storage: {[key: string]: any}) => T)): Observable<T> {
    return this.observable$.pipe(
      map(storage => selector(storage)),
    );
  }

  private emitStorageEvent(): void {
    const event = document.createEvent('StorageEvent');
    event.initEvent(AbstractStorage.STORAGE_EVENT, true, true);
    window.dispatchEvent(event);
  }
}

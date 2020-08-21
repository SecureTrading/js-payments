import { IConfig } from '../../model/config/IConfig';
import { BrowserLocalStorage } from './BrowserLocalStorage';
import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, shareReplay } from 'rxjs/operators';
import { ConfigProvider } from '../config-provider/ConfigProvider';

@Service()
export class StorageConfigProvider implements ConfigProvider {
  private static readonly STORAGE_KEY = 'app.config-provider';

  constructor(private storage: BrowserLocalStorage) {}

  getConfig(): IConfig {
    return this.storage.getItem(StorageConfigProvider.STORAGE_KEY);
  }

  getConfig$(watchForChanges: boolean = false): Observable<IConfig> {
    const config$ = this.storage
      .select(storage => storage[StorageConfigProvider.STORAGE_KEY])
      .pipe(distinctUntilChanged(), filter<IConfig>(Boolean), shareReplay(1));

    return watchForChanges ? config$ : config$.pipe(first());
  }
}

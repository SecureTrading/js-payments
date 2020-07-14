import { IConfig } from '../../../shared/model/config/IConfig';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, shareReplay } from 'rxjs/operators';

@Service()
export class ConfigProvider {
  private static readonly STORAGE_KEY = 'app.config';

  constructor(private storage: BrowserLocalStorage) {}

  getConfig(): IConfig {
    return this.storage.getItem(ConfigProvider.STORAGE_KEY);
  }

  getConfig$(watchForChanges: boolean = false): Observable<IConfig> {
    const config$ = this.storage
      .select(storage => storage[ConfigProvider.STORAGE_KEY])
      .pipe(distinctUntilChanged(), filter<IConfig>(Boolean), shareReplay(1));

    return watchForChanges ? config$ : config$.pipe(first());
  }
}

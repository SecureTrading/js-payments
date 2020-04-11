import { IConfig } from '../../../shared/model/config/IConfig';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Service } from 'typedi';
import { interval, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

@Service()
export class ConfigProvider {
  private static readonly STORAGE_KEY = 'app.config';

  constructor(private storage: BrowserLocalStorage) {}

  getConfig(): IConfig {
    return JSON.parse(this.storage.getItem(ConfigProvider.STORAGE_KEY));
  }

  getConfig$(): Observable<IConfig> {
    return interval().pipe(
      map(() => this.getConfig()),
      filter<IConfig>(Boolean),
      first()
    );
  }
}

import { IConfig } from '../../../shared/model/config/IConfig';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Service } from 'typedi';

@Service()
export class ConfigProvider {
  private static readonly STORAGE_KEY = 'app.config';

  constructor(private storage: BrowserLocalStorage) {}

  getConfig(): IConfig {
    return JSON.parse(this.storage.getItem(ConfigProvider.STORAGE_KEY));
  }
}

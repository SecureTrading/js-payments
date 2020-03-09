import { Container, Service } from 'typedi';
import { IConfig } from './model/IConfig';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';
import { CONFIG } from '../dependency-injection/InjectionTokens';
import { BrowserLocalStorage } from '../services/storage/BrowserLocalStorage';

@Service()
export class ConfigService {
  private static readonly STORAGE_KEY = 'app.config';

  constructor(
    private storage: BrowserLocalStorage,
    private resolver: ConfigResolver,
    private validator: ConfigValidator
  ) {}

  initialize(config: IConfig): IConfig {
    this.storage.setItem(ConfigService.STORAGE_KEY, null);

    const fullConfig = this.resolver.resolve(config);

    this.update(fullConfig);

    return fullConfig;
  }

  update(config: IConfig): void {
    const validationError = this.validator.validate(config);

    if (validationError) {
      throw validationError;
    }

    this.storage.setItem(ConfigService.STORAGE_KEY, JSON.stringify(config));

    Container.set(CONFIG, config);
  }
}

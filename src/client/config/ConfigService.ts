import { Container, Service } from 'typedi';
import { IConfig } from '../../shared/model/config/IConfig';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';
import { CONFIG } from '../../application/core/dependency-injection/InjectionTokens';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';

@Service()
export class ConfigService {
  private static readonly STORAGE_KEY = 'app.config';

  constructor(
    private storage: BrowserLocalStorage,
    private resolver: ConfigResolver,
    private validator: ConfigValidator
  ) {
  }

  initialize(config: IConfig): IConfig {
    const fullConfig = this.resolver.resolve(config);
    this.storage.setItem(ConfigService.STORAGE_KEY, null);

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

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
  ) {}

  update(config: IConfig): IConfig {
    this.storage.setItem(ConfigService.STORAGE_KEY, null);

    const fullConfig = this.resolver.resolve(config);
    const validationError = this.validator.validate(fullConfig);

    if (validationError) {
      throw validationError;
    }

    this.storage.setItem(ConfigService.STORAGE_KEY, JSON.stringify(fullConfig));

    Container.set(CONFIG, fullConfig);

    return fullConfig;
  }

  clear(): void {
    this.storage.setItem(ConfigService.STORAGE_KEY, null);
  }
}

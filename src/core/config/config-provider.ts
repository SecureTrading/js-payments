import { Service } from 'typedi';
import { IConfig } from './model/IConfig';
import { IStorage } from '../models/IStorage';
import { ConfigResolver } from './config-resolver';
import { ConfigValidator } from './config-validator';

@Service()
export class ConfigProvider {
  private readonly STORAGE_KEY = 'app.config';

  constructor(
    private storage: IStorage,
    private resolver: ConfigResolver,
    private validator: ConfigValidator,
  ) {
  }

  initialize(config: IConfig): void {
    const fullConfig = this.resolver.resolve(config);
    const validationError = this.validator.validate(config);

    if (validationError) {
      throw validationError;
    }

    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(fullConfig));
  }

  get(): Promise<IConfig> {
    return this.storage.ready
      .then(() => this.storage.getItem(this.STORAGE_KEY))
      .then(serializedConfig => JSON.parse(serializedConfig));
  }
}

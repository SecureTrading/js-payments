import { Container, Service } from 'typedi';
import { IConfig } from '../../shared/model/config/IConfig';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';
import { CONFIG } from '../../application/core/dependency-injection/InjectionTokens';
import { MessageBus } from '../../application/core/shared/MessageBus';
import { PUBLIC_EVENTS } from '../../application/core/shared/EventTypes';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigProvider } from '../../shared/services/config/ConfigProvider';
import { filter, first } from 'rxjs/operators';

@Service()
export class ConfigService implements ConfigProvider {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject(null);

  constructor(private resolver: ConfigResolver, private validator: ConfigValidator, private messageBus: MessageBus) {}

  update(config: IConfig): IConfig {
    const fullConfig = this.resolver.resolve(config);
    const validationError = this.validator.validate(fullConfig);

    if (validationError) {
      throw validationError;
    }

    this.config$.next(fullConfig);

    this.messageBus.publish({
      type: PUBLIC_EVENTS.CONFIG_CHANGED,
      data: JSON.parse(JSON.stringify(fullConfig))
    });

    Container.set(CONFIG, fullConfig);

    return fullConfig;
  }

  clear(): void {
    this.config$.next(null);
    this.messageBus.publish({ type: PUBLIC_EVENTS.CONFIG_CHANGED, data: null });
    Container.set(CONFIG, null);
  }

  getConfig(): IConfig {
    return this.config$.getValue();
  }

  getConfig$(watchForChanges?: boolean): Observable<IConfig> {
    if (watchForChanges) {
      return this.config$.pipe(filter<IConfig>(Boolean));
    }

    return this.config$.pipe(filter<IConfig>(Boolean), first());
  }
}

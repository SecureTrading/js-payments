import { Container, Service } from 'typedi';
import { IConfig } from '../../model/config/IConfig';
import { ConfigResolver } from '../config-resolver/ConfigResolver';
import { ConfigValidator } from '../config-validator/ConfigValidator';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { filter, first } from 'rxjs/operators';
import { CONFIG } from '../../dependency-injection/InjectionTokens';

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

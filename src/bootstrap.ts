import { Container } from 'typedi';
import { WINDOW } from './shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from './application/core/services/ConfigProvider';
import { SentryService } from './shared/services/sentry/SentryService';
import { filter, map, mapTo } from 'rxjs/operators';
import { environment } from './environments/environment';
import './testing/ServicesOverrides';

if (!Container.has(WINDOW)) {
  Container.set(WINDOW, window);
}

Container.get(ConfigProvider)
  .getConfig$()
  .pipe(
    map(config => config.errorReporting),
    filter(Boolean),
    mapTo(environment.SENTRY_DSN)
  )
  .subscribe((dsn: string) => Container.get(SentryService).init(dsn));

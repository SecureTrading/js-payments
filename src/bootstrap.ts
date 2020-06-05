import { Container } from 'typedi';
import { WINDOW } from './shared/dependency-injection/InjectionTokens';
import './testing/ServicesOverrides';
import { ConfigProvider } from './application/core/services/ConfigProvider';
import { SentryService } from './shared/services/sentry/SentryService';
import { filter, map } from 'rxjs/operators';

if (!Container.has(WINDOW)) {
  Container.set(WINDOW, window);
}

Container.get(ConfigProvider)
  .getConfig$()
  .pipe(
    map(config => config.sentryDsn),
    filter(Boolean)
  )
  .subscribe((dsn: string) => Container.get(SentryService).init(dsn));

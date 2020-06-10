import { ConfigProvider } from '../../../application/core/services/ConfigProvider';
import { Service } from 'typedi';
import { SentryContext } from './SentryContext';
import { Event } from '@sentry/types';
import { EventScrubber } from './EventScrubber';
import { Sentry } from './Sentry';
import { Observable } from 'rxjs';
import { IConfig } from '../../model/config/IConfig';
import { filter, first, switchMap, tap } from 'rxjs/operators';

@Service()
export class SentryService {
  private config$: Observable<IConfig>;

  constructor(
    private configProvider: ConfigProvider,
    private sentry: Sentry,
    private sentryContext: SentryContext,
    private eventScrubber: EventScrubber
  ) {
    this.config$ = configProvider.getConfig$(true);
  }

  init(dsn: string): void {
    if (!dsn) {
      return;
    }

    this.config$
      .pipe(
        first(),
        filter(config => config.errorReporting),
        tap(() => this.initSentry(dsn)),
        switchMap(() => this.config$)
      )
      .subscribe(config => this.sentry.setExtra('config', config));
  }

  private initSentry(dsn: string): void {
    this.sentry.setTag('hostName', this.sentryContext.getHostName());
    this.sentry.setTag('frameName', this.sentryContext.getFrameName());

    this.sentry.init({
      dsn,
      environment: this.sentryContext.getEnvironmentName(),
      release: this.sentryContext.getReleaseVersion(),
      whitelistUrls: ['https://webservices.securetrading.net'],
      beforeSend: (event: Event) => this.eventScrubber.scrub(event)
    });
  }
}

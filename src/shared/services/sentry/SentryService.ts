import { ConfigProvider } from '../../../application/core/services/ConfigProvider';
import { Service } from 'typedi';
import { SentryContext } from './SentryContext';
import { Event } from '@sentry/types';
import { EventScrubber } from './EventScrubber';
import { Sentry } from './Sentry';

@Service()
export class SentryService {
  constructor(
    private configProvider: ConfigProvider,
    private sentry: Sentry,
    private sentryContext: SentryContext,
    private eventScrubber: EventScrubber
  ) {}

  init(dsn: string): void {
    if (!dsn) {
      return;
    }

    this.sentry.setTag('hostName', this.sentryContext.getHostName());
    this.sentry.setTag('frameName', this.sentryContext.getFrameName());

    this.sentry.init({
      dsn,
      environment: this.sentryContext.getEnvironmentName(),
      release: this.sentryContext.getReleaseVersion(),
      whitelistUrls: ['https://webservices.securetrading.net'],
      beforeSend: (event: Event) => this.eventScrubber.scrub(event)
    });

    this.configProvider.getConfig$(true).subscribe(config => this.sentry.setExtra('config', config));
  }
}

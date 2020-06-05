import { ConfigProvider } from '../../../application/core/services/ConfigProvider';
import { anyFunction, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Sentry } from './Sentry';
import { SentryContext } from './SentryContext';
import { EventScrubber } from './EventScrubber';
import { SentryService } from './SentryService';
import { Selectors } from '../../../application/core/shared/Selectors';
import { EMPTY, Subject } from 'rxjs';
import { IConfig } from '../../model/config/IConfig';

describe('SentryService', () => {
  const DSN = 'https://123@456.ingest.sentry.io/7890';
  let configProviderMock: ConfigProvider;
  let sentryMock: Sentry;
  let sentryContextMock: SentryContext;
  let eventScrubberMock: EventScrubber;
  let sentryService: SentryService;

  beforeEach(() => {
    configProviderMock = mock(ConfigProvider);
    sentryMock = mock(Sentry);
    sentryContextMock = mock(SentryContext);
    eventScrubberMock = mock(EventScrubber);

    when(sentryContextMock.getFrameName()).thenReturn(Selectors.CONTROL_FRAME_IFRAME);
    when(sentryContextMock.getReleaseVersion()).thenReturn('1.2.3');
    when(sentryContextMock.getEnvironmentName()).thenReturn('prod');
    when(sentryContextMock.getHostName()).thenReturn('webservices.securetrading.net');
    when(configProviderMock.getConfig$(true)).thenReturn(EMPTY);

    sentryService = new SentryService(
      instance(configProviderMock),
      instance(sentryMock),
      instance(sentryContextMock),
      instance(eventScrubberMock)
    );
  });

  it('doesnt initialize sentry if dsn is empty', () => {
    sentryService.init('');

    verify(sentryMock.init(anything())).never();
  });

  it('initializes sentry with options', () => {
    sentryService.init(DSN);

    verify(sentryMock.setTag('hostName', 'webservices.securetrading.net')).once();
    verify(sentryMock.setTag('frameName', Selectors.CONTROL_FRAME_IFRAME)).once();

    verify(
      sentryMock.init(
        deepEqual({
          dsn: DSN,
          environment: 'prod',
          release: '1.2.3',
          whitelistUrls: ['https://webservices.securetrading.net'],
          beforeSend: anyFunction()
        })
      )
    ).once();
  });

  it('sets config to extras whenever config changes', () => {
    const config$ = new Subject<IConfig>();
    const config = ({ foo: 'bar' } as unknown) as IConfig;

    when(configProviderMock.getConfig$(true)).thenReturn(config$);

    sentryService.init(DSN);

    config$.next(config);

    verify(sentryMock.setExtra('config', config)).once();
  });
});

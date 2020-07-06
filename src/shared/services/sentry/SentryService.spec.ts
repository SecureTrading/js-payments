import { ConfigProvider } from '../../../application/core/services/ConfigProvider';
import { anyFunction, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Sentry } from './Sentry';
import { SentryContext } from './SentryContext';
import { EventScrubber } from './EventScrubber';
import { SentryService } from './SentryService';
import { Selectors } from '../../../application/core/shared/Selectors';
import { BehaviorSubject, Subject } from 'rxjs';
import { IConfig } from '../../model/config/IConfig';

describe('SentryService', () => {
  const DSN = 'https://123@456.ingest.sentry.io/7890';
  const config = ({ errorReporting: true } as unknown) as IConfig;

  let configProviderMock: ConfigProvider;
  let sentryMock: Sentry;
  let sentryContextMock: SentryContext;
  let eventScrubberMock: EventScrubber;
  let sentryService: SentryService;
  let config$: Subject<IConfig>;

  beforeEach(() => {
    configProviderMock = mock(ConfigProvider);
    sentryMock = mock(Sentry);
    sentryContextMock = mock(SentryContext);
    eventScrubberMock = mock(EventScrubber);
    config$ = new BehaviorSubject(config);

    when(sentryContextMock.getFrameName()).thenReturn(Selectors.CONTROL_FRAME_IFRAME);
    when(sentryContextMock.getReleaseVersion()).thenReturn('1.2.3');
    when(sentryContextMock.getEnvironmentName()).thenReturn('prod');
    when(sentryContextMock.getHostName()).thenReturn('webservices.securetrading.net');
    when(configProviderMock.getConfig$(true)).thenReturn(config$);

    sentryService = new SentryService(
      instance(configProviderMock),
      instance(sentryMock),
      instance(sentryContextMock),
      instance(eventScrubberMock)
    );
  });

  it('doesnt initialize sentry if dsn is empty', () => {
    sentryService.init(null);

    verify(sentryMock.init(anything())).never();
  });

  it('doesnt initialize sentry if errorReporting is set to false', () => {
    config$.next({ errorReporting: false } as IConfig);

    sentryService.init(null);

    verify(sentryMock.init(anything())).never();
  });

  it('initializes sentry with options', done => {
    const whitelistUrls = ['https://webservices.securetrading.net'];

    sentryService.init(DSN, whitelistUrls);

    verify(sentryMock.setTag('hostName', 'webservices.securetrading.net')).once();
    verify(sentryMock.setTag('frameName', Selectors.CONTROL_FRAME_IFRAME)).once();
    verify(sentryMock.setExtra('config', config));
    verify(
      sentryMock.init(
        deepEqual({
          whitelistUrls,
          dsn: DSN,
          environment: 'prod',
          release: '1.2.3',
          beforeSend: anyFunction()
        })
      )
    ).once();

    setTimeout(() => done());
  });

  it('sets config to extras whenever config changes', () => {
    sentryService.init(DSN);

    config$.next(config);
    config$.next(config);
    config$.next(config);

    verify(sentryMock.setExtra('config', config)).times(4);
  });
});

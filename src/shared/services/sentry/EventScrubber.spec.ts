import { Event } from '@sentry/types';
import { EventScrubber } from './EventScrubber';

describe('EventScrubber', () => {
  let eventScrubber: EventScrubber;

  beforeEach(() => {
    eventScrubber = new EventScrubber();
  });

  it('masks the jtw in the config in extras', () => {
    const event: Event = {
      extra: {
        config: {
          jwt: 'some-long-jwt-value',
          foo: 'bar'
        }
      }
    };

    const result = eventScrubber.scrub(event);

    expect(result.extra.config).toEqual({
      jwt: '*****',
      foo: 'bar'
    });
  });

  it('masks the jwt in requests url and query_string', () => {
    const event: Event = {
      request: {
        url: 'https://webservices.securetrading.net?foo=bar&jwt=some-long-jwt&xyz=abc',
        query_string: 'jwt=some-long-jwt'
      }
    };

    const result = eventScrubber.scrub(event);

    expect(result.request.url).toBe('https://webservices.securetrading.net?foo=bar&jwt=*****&xyz=abc');
    expect(result.request.query_string).toBe('jwt=*****');
  });
});

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

    const { config } = eventScrubber.scrub(event).extra;

    expect(config).toEqual({
      jwt: '*****',
      foo: 'bar'
    });
  });

  it('masks the jwt in requests url and query_string', () => {
    const urlWithJwt = (jwt: string) => `https://webservices.securetrading.net?foo=bar&jwt=${jwt}&xyz=abc`;
    const event: Event = {
      request: {
        url: urlWithJwt('some-long-jwt'),
        query_string: 'jwt=some-long-jwt'
      }
    };

    const result = eventScrubber.scrub(event);

    expect(result.request.url).toBe(urlWithJwt('*****'));
    expect(result.request.query_string).toBe('jwt=*****');
  });
});

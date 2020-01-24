import each from 'jest-each';
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import Language from '../../../src/core/shared/Language';
import {StTransport} from '../../../src/core/classes/StTransport.class';
import Utils from '../../../src/core/shared/Utils';

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

// given
describe('StTransport class', () => {
  // given
  describe('Method sendRequest', () => {
    const {
      rejectingPromise,
      resolvingPromise,
      TimeoutError,
      DEFAULT_PARAMS,
      instance,
      fetchRetryObject
    } = stTransportFixture();
    let mockFT: jest.Mock;

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._fetchRetry = jest.fn();
      // This effectively creates a MVP codec so that we aren't testing all that here
      instance.codec.encode = jest.fn(x => JSON.stringify(x));
      instance.codec.decode = jest.fn(x => {
        return new Promise((resolve, reject) => {
          if ('json' in x) {
            resolve(x.json());
          }
          reject(new Error('codec error'));
        });
      });
      // @ts-ignore
      mockFT = instance._fetchRetry as jest.Mock;
    });

    // then
    each([[{ requesttypedescription: 'AUTH' }]]).it('should build the fetch options', async requestObject => {
      mockFT.mockReturnValue(
        resolvingPromise({
          json: () =>
            resolvingPromise({
              errorcode: 0
            })
        })
      );
      await instance.sendRequest(requestObject);
      // @ts-ignore
      expect(instance._fetchRetry).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._fetchRetry).toHaveBeenCalledWith(DEFAULT_PARAMS.gatewayUrl, {
        // @ts-ignore
        ...StTransport.DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify(requestObject)
      });
    });

    // then
    each([[resolvingPromise({}), resolvingPromise({})], [rejectingPromise(TimeoutError), resolvingPromise({})]]).it(
      'should reject invalid responses',
      async (mockFetch, expected) => {
        mockFT.mockReturnValue(mockFetch);

        async function testSendRequest() {
          return await instance.sendRequest({ requesttypedescription: 'AUTH' });
        }

        let response = testSendRequest();
        expect(response).toMatchObject(expected);
      }
    );

    // then
    each([
      [
        resolvingPromise({
          json: () =>
            resolvingPromise({
              response: [
                {
                  errorcode: 0
                }
              ],
              version: '1.00'
            })
        }),
        { response: [{ errorcode: 0 }], version: '1.00' }
      ]
    ]).it('should decode the json response', async (mockFetch, expected) => {
      mockFT.mockReturnValue(mockFetch);
      await expect(instance.sendRequest({ requesttypedescription: 'AUTH' })).resolves.toEqual(expected);
      expect(instance.codec.decode).toHaveBeenCalledWith({
        json: expect.any(Function)
      });
    });
  });

  // given
  describe('_fetchRetry()', () => {
    const {
      instance,
      fetchRetryObject: { options, url, connectTimeout, delay, retries, retryTimeout }
    } = stTransportFixture();
    // when
    beforeEach(() => {
      Utils.promiseWithTimeout = jest.fn();
    });

    // then
    it('should call Utils.retryPromise with provided parameters', () => {
      Utils.retryPromise = jest.fn();
      // @ts-ignore
      instance._fetchRetry(url, options, connectTimeout, delay, retries, retryTimeout);
      expect(Utils.retryPromise).toHaveBeenCalled();
    });

    // then
    it('should call Utils.retryPromise with default parameters', () => {
      Utils.retryPromise = jest.fn();
      // @ts-ignore
      instance._fetchRetry(url, options);
      expect(Utils.retryPromise).toHaveBeenCalled();
    });
  });
});

function stTransportFixture() {
  const DEFAULT_PARAMS = {
    gatewayUrl: 'https://example.com',
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU3NDIzNDgyLjk0MzE1MywicGF5bG9hZCI6eyJjdXN0b21lcnRvd24iOiJCYW5nb3IiLCJiaWxsaW5ncG9zdGNvZGUiOiJURTEyIDNTVCIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJjdXN0b21lcnByZW1pc2UiOiIxMiIsImJpbGxpbmdsYXN0bmFtZSI6Ik5hbWUiLCJsb2NhbGUiOiJlbl9HQiIsImJhc2VhbW91bnQiOiIxMDAwIiwiYmlsbGluZ2VtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImJpbGxpbmdwcmVtaXNlIjoiMTIiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImJpbGxpbmdzdHJlZXQiOiJUZXN0IHN0cmVldCIsImN1c3RvbWVyc3RyZWV0IjoiVGVzdCBzdHJlZXQiLCJjdXN0b21lcnBvc3Rjb2RlIjoiVEUxMiAzU1QiLCJjdXN0b21lcmxhc3RuYW1lIjoiTmFtZSIsImJpbGxpbmd0ZWxlcGhvbmUiOiIwMTIzNCAxMTEyMjIiLCJiaWxsaW5nZmlyc3RuYW1lIjoiVGVzdCIsImJpbGxpbmd0b3duIjoiQmFuZ29yIiwiYmlsbGluZ3RlbGVwaG9uZXR5cGUiOiJNIn19.08q3gem0kW0eODs5iGQieKbpqu7pVcvQF2xaJIgtrnc'
  };

  const fetchRetryObject = {
    url: 'https://example.com',
    options: {},
    connectTimeout: 20000,
    delay: 2000,
    retries: 3,
    retryTimeout: 20000
  };

  const instance: StTransport = new StTransport(DEFAULT_PARAMS);
  const TimeoutError = Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT);
  const resolvingPromise = (result: object) => {
    return new Promise(resolve => resolve(result));
  };

  const rejectingPromise = (reason: Error) => {
    return new Promise((_, reject) => reject(reason));
  };

  return { TimeoutError, resolvingPromise, rejectingPromise, instance, DEFAULT_PARAMS, fetchRetryObject };
}

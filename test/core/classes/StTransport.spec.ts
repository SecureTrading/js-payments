import each from 'jest-each';
// global.fetch = require('jest-fetch-mock');
import { GlobalWithFetchMock } from 'jest-fetch-mock';
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
import Language from '../../../src/core/shared/Language';
import StTransport from '../../../src/core/classes/StTransport.class';

describe('StTransport class', () => {
  const DEFAULT_PARAMS = {
    gatewayUrl: 'https://example.com',
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU3NDIzNDgyLjk0MzE1MywicGF5bG9hZCI6eyJjdXN0b21lcnRvd24iOiJCYW5nb3IiLCJiaWxsaW5ncG9zdGNvZGUiOiJURTEyIDNTVCIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJjdXN0b21lcnByZW1pc2UiOiIxMiIsImJpbGxpbmdsYXN0bmFtZSI6Ik5hbWUiLCJsb2NhbGUiOiJlbl9HQiIsImJhc2VhbW91bnQiOiIxMDAwIiwiYmlsbGluZ2VtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImJpbGxpbmdwcmVtaXNlIjoiMTIiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImJpbGxpbmdzdHJlZXQiOiJUZXN0IHN0cmVldCIsImN1c3RvbWVyc3RyZWV0IjoiVGVzdCBzdHJlZXQiLCJjdXN0b21lcnBvc3Rjb2RlIjoiVEUxMiAzU1QiLCJjdXN0b21lcmxhc3RuYW1lIjoiTmFtZSIsImJpbGxpbmd0ZWxlcGhvbmUiOiIwMTIzNCAxMTEyMjIiLCJiaWxsaW5nZmlyc3RuYW1lIjoiVGVzdCIsImJpbGxpbmd0b3duIjoiQmFuZ29yIiwiYmlsbGluZ3RlbGVwaG9uZXR5cGUiOiJNIn19.08q3gem0kW0eODs5iGQieKbpqu7pVcvQF2xaJIgtrnc'
  };
  describe('Method sendRequest', () => {
    let st: StTransport;
    let mockFT: jest.Mock;

    beforeEach(() => {
      st = new StTransport(DEFAULT_PARAMS);
      st.fetchRetry = jest.fn();
      // This effectively creates a MVP codec so that we aren't testing all that here
      st.codec.encode = jest.fn(x => JSON.stringify(x));
      st.codec.decode = jest.fn(x => {
        return new Promise((resolve, reject) => {
          if ('json' in x) {
            resolve(x.json());
          }
          reject(new Error('codec error'));
        });
      });
      mockFT = st.fetchRetry as jest.Mock;
    });

    each([[{ requesttypedescription: 'AUTH' }]]).it('should build the fetch options', async requestObject => {
      mockFT.mockReturnValue(
        resolvingPromise({
          json: () =>
            resolvingPromise({
              errorcode: 0
            })
        })
      );
      await st.sendRequest(requestObject);
      expect(st.fetchRetry).toHaveBeenCalledTimes(1);
      expect(st.fetchRetry).toHaveBeenCalledWith(DEFAULT_PARAMS.gatewayUrl, {
        ...StTransport.DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify(requestObject)
      });
    });

    each([[resolvingPromise({}), resolvingPromise({})], [rejectingPromise(TimeoutError), resolvingPromise({})]]).it(
      'should reject invalid responses',
      async (mockFetch, expected) => {
        mockFT.mockReturnValue(mockFetch);
        async function testSendRequest() {
          return await st.sendRequest({ requesttypedescription: 'AUTH' });
        }
        let response = testSendRequest();
        expect(response).toMatchObject(expected);
      }
    );

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
      await expect(st.sendRequest({ requesttypedescription: 'AUTH' })).resolves.toEqual(expected);
      expect(st.codec.decode).toHaveBeenCalledWith({
        json: expect.any(Function)
      });
    });
  });

  describe('fetchRetry', () => {
    // No need to test this since it's only a wrapper for some tools from utils
  });
});

const TimeoutError = Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT);
function resolvingPromise(result: object) {
  return new Promise(resolve => resolve(result));
}

function rejectingPromise(reason: Error) {
  return new Promise((_, reject) => reject(reason));
}

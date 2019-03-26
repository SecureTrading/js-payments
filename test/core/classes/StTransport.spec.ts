import each from 'jest-each';
// global.fetch = require('jest-fetch-mock');
import { GlobalWithFetchMock } from 'jest-fetch-mock';
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
import Language from '../../../src/core/shared/Language';
import StTransport from '../../../src/core/classes/StTransport.class';

describe('StTransport class', () => {
  const DEFAULT_PARAMS = { jwt: 'j.w.t' };
  describe('Method sendRequest', () => {
    let st: StTransport;
    let mockFT: jest.Mock;

    beforeEach(() => {
      st = new StTransport(DEFAULT_PARAMS);
      st.fetchRetry = jest.fn();
      // This effectively creates a MVP codec so that we aren't testing all that here
      st.codec.encode = jest.fn(x => JSON.stringify(x));
      st.codec.decode = jest.fn(x => {
        if ('json' in x) {
          return x.json();
        }
        throw new Error('codec error');
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
      expect(st.fetchRetry).toHaveBeenCalledWith(StTransport.GATEWAY_URL, {
        ...StTransport.DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify(requestObject)
      });
    });

    each([[resolvingPromise({}), Error('codec error')], [rejectingPromise(TimeoutError), TimeoutError]]).it(
      'should reject invalid responses',
      async (mockFetch, expected) => {
        mockFT.mockReturnValue(mockFetch);
        await expect(st.sendRequest({ requesttypedescription: 'AUTH' })).rejects.toEqual(expected);
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

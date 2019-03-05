import each from 'jest-each';
// global.fetch = require('jest-fetch-mock');
import { GlobalWithFetchMock } from 'jest-fetch-mock';
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
import Language from '../../../src/core/classes/Language.class';
import StTransport from '../../../src/core/classes/StTransport.class';

describe('StTransport class', () => {
  const DEFAULT_PARAMS = { jwt: 'j.w.t' };
  describe('Method sendRequest', () => {
    let st: StTransport;
    let mockFT: jest.Mock;

    beforeEach(() => {
      st = new StTransport(DEFAULT_PARAMS);
      st.fetchTimeout = jest.fn();
      st.codec.encode = jest.fn(x => JSON.stringify(x));
      st.codec.verifyResponseObject = jest.fn(x => x);
      mockFT = st.fetchTimeout as jest.Mock;
    });

    each([[{ requesttypedescription: 'AUTH' }]]).it(
      'should build the fetch options',
      async requestObject => {
        mockFT.mockReturnValue(
          resolvingPromise({
            json: () =>
              resolvingPromise({
                errorcode: 0
              })
          })
        );
        await st.sendRequest(requestObject);
        expect(st.fetchTimeout).toHaveBeenCalledTimes(1);
        expect(st.fetchTimeout).toHaveBeenCalledWith(StTransport.GATEWAY_URL, {
          ...StTransport.DEFAULT_FETCH_OPTIONS,
          body: JSON.stringify(requestObject)
        });
      }
    );

    each([
      [
        resolvingPromise({}),
        Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE)
      ],
      [rejectingPromise(TimeoutError), TimeoutError]
    ]).it('should reject invalid responses', async (mockFetch, expected) => {
      mockFT.mockReturnValue(mockFetch);
      await expect(
        st.sendRequest({ requesttypedescription: 'AUTH' })
      ).rejects.toEqual(expected);
    });

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
        { errorcode: 0 }
      ]
    ]).it('should decode the json response', async (mockFetch, expected) => {
      mockFT.mockReturnValue(mockFetch);
      await expect(
        st.sendRequest({ requesttypedescription: 'AUTH' })
      ).resolves.toEqual(expected);
    });
  });

  describe('Method fetchTimeout', () => {
    let st: StTransport;

    beforeEach(() => {
      st = new StTransport(DEFAULT_PARAMS);
    });
    afterEach(() => {
      fetchMock.resetMocks();
    });

    it('should return promise if fetched successfully', async () => {
      fetchMock.mockResponse('{"errorcode": 0}');
      await expect(st.fetchTimeout('', {})).resolves.toEqual(
        new Response('{"errorcode": 0}')
      );
    });

    it('should timeout if the request takes too long', async () => {
      fetchMock.mockResponse(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ body: '{"errorcode": 0}' }), 10)
          )
      );
      await expect(st.fetchTimeout('', {}, 2)).rejects.toEqual(TimeoutError);
    });
  });
});

const TimeoutError = Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT);
function resolvingPromise(result: object) {
  return new Promise(resolve => resolve(result));
}

function rejectingPromise(reason: Error) {
  return new Promise((_, reject) => reject(reason));
}

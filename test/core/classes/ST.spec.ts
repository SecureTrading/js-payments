import each from 'jest-each';
// global.fetch = require('jest-fetch-mock');
import { GlobalWithFetchMock } from 'jest-fetch-mock';
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
import Language from '../../../src/core/classes/Language.class';
import ST from '../../../src/core/classes/ST.class';

each([
  [
    {},
    new Promise(resolve =>
      resolve({
        json: () => {
          return {
            result: 'success'
          };
        }
      })
    ),
    true,
    { result: 'success' }
  ],
  [
    {},
    new Promise(resolve => resolve({})),
    false,
    Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE)
  ],
  [
    {},
    new Promise((_, reject) =>
      reject(new Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT))
    ),
    false,
    Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT)
  ],
  [{}, new Promise((_, reject) => reject('Narp')), false, 'Narp']
]).test(
  'ST.sendRequest',
  async (requestObject, mockFetch, resolves, expected) => {
    const st = new ST('id');
    st.fetchTimeout = jest.fn();
    (st.fetchTimeout as jest.Mock).mockReturnValue(mockFetch);
    const promise = st.sendRequest(requestObject);
    expect(st.fetchTimeout).toHaveBeenCalledTimes(1);
    expect(st.fetchTimeout).toHaveBeenCalledWith(ST.API_URL, {
      body: JSON.stringify(requestObject),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post'
    });
    await expect(promise)[resolves ? 'resolves' : 'rejects'].toEqual(expected);
  }
);

test('ST.fetchTimeout', async () => {
  const st = new ST('id');
  fetchMock.mockResponse(
    () => new Promise(resolve => setTimeout(() => resolve({}), 100))
  );
  const promise = st.fetchTimeout('', {}, 50);
  await expect(promise).rejects.toEqual(
    new Error(Language.translations.COMMUNICATION_ERROR_TIMEOUT)
  );
  fetchMock.resetMocks();
});

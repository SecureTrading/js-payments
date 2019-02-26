import each from 'jest-each';
import StRequest from '../../../src/core/classes/StRequest.class';

describe('StRequest class', () => {
  const requestid = expect.stringMatching(/^J-[\da-z]{8}$/);
  let str: StRequest;

  describe('Method _createRequestId', () => {
    beforeEach(() => {
      str = new StRequest('');
    });
    it('generates a request id', () => {
      expect(str._createRequestId()).toEqual(requestid);
    });
    it('generates reasonably unique ids', () => {
      const attempts = 99999;
      const results = new Set();
      for (let i = 0; i < attempts; i++) {
        results.add(str._createRequestId());
      }
      expect(results.size).toEqual(attempts);
    });
  });

  describe('Method buildRequestObject', () => {
    const jwt = 'j.w.t';
    beforeEach(() => {
      str = new StRequest(jwt);
    });

    it('should refuse to build a request with no data', () => {
      expect(str.buildRequestObject({}, 'AUTH')).toEqual(false);
    });

    it('should refuse to build a request with an invalid rtd', () => {
      expect(
        str.buildRequestObject(
          { pan: '4111111111111111' },
          'LARGEHADRONCOLLIDER'
        )
      ).toEqual(false);
    });

    each([
      [
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321' },
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321' }
      ],
      [
        {
          jwt: '1.2.3',
          requestid: 'number1',
          requesttypedescription: 'CHACHETOKENISE'
        },
        {}
      ]
    ]).it(
      'should build the request for a valid object',
      (requestObject, expected) => {
        const requesttypedescription = 'AUTH';
        expect(
          str.buildRequestObject(requestObject, requesttypedescription)
        ).toEqual({
          request: [{ jwt, requestid, requesttypedescription, ...expected }],
          version: StRequest.VERSION
        });
      }
    );
  });
});

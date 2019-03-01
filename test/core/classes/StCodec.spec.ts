import each from 'jest-each';
import Language from '../../../src/core/classes/Language.class';
import { StCodec } from '../../../src/core/classes/StCodec.class';

describe('StCodec class', () => {
  const ridRegex = 'J-[\\da-z]{8}';
  const requestid = expect.stringMatching(new RegExp('^' + ridRegex + '$'));
  const jwt = 'j.w.t';
  let str: StCodec;

  describe('Method _createRequestId', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
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
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    each([
      [
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321' },
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321' }
      ],
      [
        {
          requestid: 'number1',
          requesttypedescription: 'CACHETOKENISE'
        },
        { requesttypedescription: 'CACHETOKENISE' }
      ]
    ]).it(
      'should build the request for a valid object',
      (requestObject, expected) => {
        expect(str.buildRequestObject(requestObject)).toEqual({
          jwt,
          request: [{ requestid, ...expected }],
          version: StCodec.VERSION
        });
      }
    );
  });

  describe('Method encode', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    each([
      [
        { pan: '4111111111111111', requesttypedescription: 'AUTH' },
        expect.stringMatching(
          new RegExp(
            '^{"jwt":"j.w.t","request":\\[{"pan":"4111111111111111","requesttypedescription":"AUTH","requestid":"' +
              ridRegex +
              '"}\\],"version":"1.00"}$'
          )
        )
      ]
    ]).it('should encode valid data', (request, expected) => {
      str.buildRequestObject = jest.fn(str.buildRequestObject);
      expect(str.encode(request)).toEqual(expected);
      expect(str.buildRequestObject).toHaveBeenCalledWith(request);
    });
    it('should refuse to build a request with no data', () => {
      expect(() => str.encode({ requesttypedescription: 'AUTH' })).toThrow(
        Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST)
      );
    });

    it('should refuse to build a request with an invalid rtd', () => {
      expect(() =>
        str.encode({
          pan: '4111111111111111',
          requesttypedescription: 'LARGEHADRONCOLLIDER'
        })
      ).toThrow(
        Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST)
      );
    });
  });

  describe('Method decode', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    it('should decode a valid response', () => {
      expect(
        str.decode({
          json: () => {
            return { errorcode: 0 };
          }
        })
      ).toEqual({ errorcode: 0 });
    });

    it('should error an invalid response', () => {
      expect(() => str.decode({})).toThrow(
        Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });
  });
});

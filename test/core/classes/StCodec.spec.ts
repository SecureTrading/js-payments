import each from 'jest-each';
import Language from '../../../src/core/shared/Language';
import { StCodec } from '../../../src/core/classes/StCodec.class';

describe('StCodec class', () => {
  const ridRegex = 'J-[\\da-z]{8}';
  const requestid = expect.stringMatching(new RegExp('^' + ridRegex + '$'));
  const jwt = 'j.w.t';
  let str: StCodec;
  const fullResponse = {
    requestreference: 'W33-0rm0gcyx',
    response: [
      {
        accounttypedescription: 'ECOM',
        acquirerresponsecode: '00',
        authcode: 'TEST56',
        baseamount: '100',
        currencyiso3a: 'GBP',
        dccenabled: '0',
        errorcode: '0',
        errormessage: 'Ok',
        issuer: 'SecureTrading Test Issuer1',
        issuercountryiso2a: 'US',
        livestatus: '0',
        maskedpan: '411111######0211',
        merchantcountryiso2a: 'GB',
        merchantname: 'webservice UNICODE merchantname',
        merchantnumber: '00000000',
        operatorname: 'webservices@securetrading.com',
        orderreference: 'AUTH_VISA_POST-PASS-JSON-JSON',
        paymenttypedescription: 'VISA',
        requesttypedescription: 'AUTH',
        securityresponseaddress: '2',
        securityresponsepostcode: '2',
        securityresponsesecuritycode: '2',
        settleduedate: '2019-02-21',
        settlestatus: '0',
        splitfinalnumber: '1',
        tid: '27882788',
        transactionreference: '33-9-80168',
        transactionstartedtimestamp: '2019-02-21 10:06:35'
      }
    ],
    secrand: 'ZKAVMskWQ',
    version: '1.00'
  };

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
    ]).it('should build the request for a valid object', (requestObject, expected) => {
      expect(str.buildRequestObject(requestObject)).toEqual({
        jwt,
        request: [{ requestid, ...expected }],
        version: StCodec.VERSION
      });
    });
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
      ).toThrow(Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST));
    });
  });

  describe('Method verifyResponseObject', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    each([
      [{}],
      [{ version: '3.02' }],
      [{ version: '1.00', response: [] }],
      [{ version: '1.00', response: [{}, {}] }]
    ]).it('should verify the version and number of responses', responseData => {
      expect(() => StCodec.verifyResponseObject(responseData)).toThrow(
        Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });

    each([
      [
        {
          response: [{ errorcode: 30000, errormessage: 'Field error' }],
          version: '1.00'
        }
      ]
    ]).it('should verify the gateway error response', responseData => {
      expect(() => StCodec.verifyResponseObject(responseData)).toThrow(Error(responseData.response[0].errormessage));
    });
  });

  describe('Method decode', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    it('should decode a valid response', async () => {
      StCodec.verifyResponseObject = jest.fn(StCodec.verifyResponseObject);
      await expect(
        str.decode({
          json: () => {
            return new Promise(resolve => resolve(fullResponse));
          }
        })
      ).resolves.toEqual(StCodec.verifyResponseObject(fullResponse));
      expect(StCodec.verifyResponseObject).toHaveBeenCalledWith(fullResponse);
    });

    it('should error an invalid response', async () => {
      await expect(str.decode({})).rejects.toThrow(Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
    });
  });
});

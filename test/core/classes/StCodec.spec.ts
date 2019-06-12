import each from 'jest-each';
import Language from '../../../src/core/shared/Language';
import { StCodec } from '../../../src/core/classes/StCodec.class';

describe('StCodec class', () => {
  const { instance } = stCodecFixture();
  const ridRegex = 'J-[\\da-z]{8}';
  const requestid = expect.stringMatching(new RegExp('^' + ridRegex + '$'));
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  let str: StCodec;
  // @ts-ignore
  StCodec._notification.error = jest.fn();
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

  describe('StCodec.publishResponse', () => {
    beforeEach(() => {
      // @ts-ignore
      StCodec._translator.translate = jest.fn();
      // @ts-ignore
      StCodec._translator.translate.mockReturnValueOnce('Translated');
      // @ts-ignore
      StCodec._messageBus.publish = jest.fn();
      // @ts-ignore
      StCodec._messageBus.publishToSelf = jest.fn();
    });

    it('should translate and publish result to parent', () => {
      // @ts-ignore
      StCodec._parentOrigin = 'https://example.com';
      // @ts-ignore
      StCodec.publishResponse({
        errorcode: '0',
        errormessage: 'Ok'
      });
      // @ts-ignore
      expect(StCodec._translator.translate).toHaveBeenCalledWith('Ok');
      // @ts-ignore
      expect(StCodec._messageBus.publish).toHaveBeenCalledWith(
        {
          data: {
            errorcode: '0',
            errormessage: 'Translated'
          },
          type: 'TRANSACTION_COMPLETE'
        },
        true
      );
      // @ts-ignore
      expect(StCodec._messageBus.publishToSelf).toHaveBeenCalledTimes(0);
    });

    it('should translate and publish result to itself', () => {
      // @ts-ignore
      StCodec._parentOrigin = undefined;
      // @ts-ignore
      StCodec.publishResponse({
        errorcode: '0',
        errormessage: 'Ok'
      });
      // @ts-ignore
      expect(StCodec._translator.translate).toHaveBeenCalledWith('Ok');
      // @ts-ignore
      expect(StCodec._messageBus.publish).toHaveBeenCalledTimes(0);
      // @ts-ignore
      expect(StCodec._messageBus.publishToSelf).toHaveBeenCalledWith({
        data: {
          errorcode: '0',
          errormessage: 'Translated'
        },
        type: 'TRANSACTION_COMPLETE'
      });
    });
  });

  describe('StCodec._createCommunicationError', () => {
    it('return valid error response', () => {
      // @ts-ignore
      expect(StCodec._createCommunicationError()).toMatchObject({
        errorcode: '50003',
        errormessage: 'Invalid response'
      });
    });
  });

  describe('StCodec._createRequestId', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    it('generates a request id', () => {
      expect(StCodec._createRequestId()).toEqual(requestid);
    });
    it('generates reasonably unique ids', () => {
      const attempts = 99999;
      const results = new Set();
      for (let i = 0; i < attempts; i++) {
        results.add(StCodec._createRequestId());
      }
      expect(results.size).toEqual(attempts);
    });
  });

  describe('StCodec.buildRequestObject', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    each([
      [
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321' },
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321', sitereference: 'live2' }
      ],
      [
        {
          requestid: 'number1',
          requesttypedescription: 'CACHETOKENISE'
        },
        { requesttypedescription: 'CACHETOKENISE', sitereference: 'live2' }
      ]
    ]).it('should build the request for a valid object', (requestObject, expected) => {
      expect(str.buildRequestObject(requestObject)).toEqual({
        jwt,
        request: [{ requestid, ...expected }],
        version: StCodec.VERSION
      });
    });
  });

  describe('StCodec.encode', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    each([
      [
        { pan: '4111111111111111', requesttypedescription: 'AUTH' },
        expect.stringMatching(
          new RegExp(
            '^{"jwt":"' +
              jwt +
              '","request":\\[{"pan":"4111111111111111","requesttypedescription":"AUTH","requestid":"' +
              ridRegex +
              '","sitereference":"live2"}\\],"version":"1.00"}$'
          )
        )
      ]
    ]).it('should encode valid data', (request, expected) => {
      str.buildRequestObject = jest.fn(str.buildRequestObject);
      expect(str.encode(request)).toEqual(expected);
      expect(str.buildRequestObject).toHaveBeenCalledWith(request);
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

  describe('StCodec.verifyResponseObject', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    each([
      [{}],
      [{ version: '3.02' }],
      [{ version: '1.00', response: [] }],
      [{ version: '1.00', response: [{}, {}] }]
    ]).it('should verify the version and number of responses', responseData => {
      expect(() => instance.verifyResponseObject(responseData)).toThrow(
        Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
      // @ts-ignore
      expect(StCodec.publishResponse).toHaveBeenCalledWith({ errorcode: '50003', errormessage: 'Invalid response' });
    });
  });

  describe('StCodec.decode', () => {
    beforeEach(() => {
      str = new StCodec(jwt);
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    it('should decode a valid response', async () => {
      instance.verifyResponseObject = jest.fn(instance.verifyResponseObject);
      await expect(
        str.decode({
          json: () => {
            return new Promise(resolve => resolve(fullResponse));
          }
        })
      ).resolves.toEqual(instance.verifyResponseObject(fullResponse));
      expect(instance.verifyResponseObject).toHaveBeenCalledWith(fullResponse);
    });

    it('should error an invalid response', async () => {
      await expect(str.decode({})).rejects.toThrow(Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
      // @ts-ignore
      expect(StCodec.publishResponse).toHaveBeenCalledWith({
        errorcode: '50003',
        errormessage: 'Invalid response'
      });
    });
  });
});

function stCodecFixture() {
  const jwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU1OTg1OTUyNC4yMzkxMjQ4LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSJ9fQ.OKrm6cXJTDcclJAUKjFV2IoHy9tBILmp_kqxxh3wy9E';
  const instance = StCodec;
  return { instance };
}

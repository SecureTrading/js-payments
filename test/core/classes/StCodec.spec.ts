import each from 'jest-each';
import Language from '../../../src/core/shared/Language';
import { StCodec } from '../../../src/core/classes/StCodec.class';
import { Translator } from '../../../src/core/shared/Translator';

describe('StCodec class', () => {
  const { instance, jwt, responseJwt } = stCodecFixture();
  const ridRegex = 'J-[\\da-z]{8}';
  const requestid = expect.stringMatching(new RegExp('^' + ridRegex + '$'));
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
    let translator: Translator;
    beforeEach(() => {
      // @ts-ignore
      translator = new Translator('en_GB');
      translator.translate = jest.fn().mockReturnValue('Ok');
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
      expect(translator.translate()).toEqual('Ok');
      // @ts-ignore
      expect(StCodec._messageBus.publish).toHaveBeenCalledWith(
        {
          data: {
            errorcode: '0',
            errormessage: 'Ok'
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
      expect(translator.translate()).toEqual('Ok');
      // @ts-ignore
      expect(StCodec._messageBus.publish).toHaveBeenCalledTimes(0);
      //@ts-ignore
      expect(StCodec._messageBus.publishToSelf).toHaveBeenCalledWith({
        data: {
          errorcode: '0',
          errormessage: 'Ok'
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
          requesttypedescriptions: ['CACHETOKENISE']
        },
        { requesttypedescriptions: ['CACHETOKENISE'], sitereference: 'live2' }
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
        { pan: '4111111111111111', requesttypedescriptions: ['AUTH'] },
        expect.stringMatching(
          new RegExp(
            '^{"acceptcustomeroutput":"1.00","jwt":"' +
              jwt +
              '","request":\\[{"pan":"4111111111111111","requesttypedescriptions":\\["AUTH"\\],"requestid":"' +
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
          requesttypedescriptions: ['LARGEHADRONCOLLIDER']
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
      expect(() => instance.verifyResponseObject(responseData, responseJwt)).toThrow(
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
      ).resolves.toEqual(instance.verifyResponseObject(fullResponse, responseJwt));
      expect(instance.verifyResponseObject).toHaveBeenCalledWith(fullResponse, responseJwt);
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const responseJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjExMDk1MDQsInBheWxvYWQiOnsicmVxdWVzdHJlZmVyZW5jZSI6Ilc0Mi10NGU0Y3I5NSIsInZlcnNpb24iOiIxLjAwIiwicmVzcG9uc2UiOlt7InRyYW5zYWN0aW9uc3RhcnRlZHRpbWVzdGFtcCI6IjIwMTktMDYtMjEgMDk6MzE6NDQiLCJwYXJlbnR0cmFuc2FjdGlvbnJlZmVyZW5jZSI6IjQyLTktODAwMzgiLCJjdXN0b21lcm91dHB1dCI6IlJFU1VMVCIsImxpdmVzdGF0dXMiOiIwIiwibWVyY2hhbnRuYW1lIjoiVGVzdCBVbml0dGVzdCBTaXRlIiwic3BsaXRmaW5hbG51bWJlciI6IjEiLCJ4aWQiOiJZa0pNTTBKM1ZuaHNabTE2U25kSWVYQm1NakE9IiwiZGNjZW5hYmxlZCI6IjAiLCJzZXR0bGVkdWVkYXRlIjoiMjAxOS0wNi0yMSIsImVycm9yY29kZSI6IjAiLCJ0aWQiOiIyNzg4MDAwMCIsImlzc3VlciI6IlNlY3VyZVRyYWRpbmcgVGVzdCBJc3N1ZXIxIiwibWVyY2hhbnRudW1iZXIiOiIwMDAwMDAwMCIsIm1lcmNoYW50Y291bnRyeWlzbzJhIjoiR0IiLCJzdGF0dXMiOiJZIiwidHJhbnNhY3Rpb25yZWZlcmVuY2UiOiI0Mi05LTgwMDM5IiwidGhyZWVkdmVyc2lvbiI6IjEuMC4yIiwicGF5bWVudHR5cGVkZXNjcmlwdGlvbiI6IlZJU0EiLCJiYXNlYW1vdW50IjoiMTAwMCIsImVjaSI6IjA1IiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjYXZ2IjoiQUFBQkFXRmxtUUFBQUFCalJXV1pFRUZnRno4PSIsImFjcXVpcmVycmVzcG9uc2Vjb2RlIjoiMDAiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9uIjoiQVVUSCIsInNlY3VyaXR5cmVzcG9uc2VzZWN1cml0eWNvZGUiOiIyIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsImF1dGhjb2RlIjoiVEVTVDk4IiwiZXJyb3JtZXNzYWdlIjoiT2siLCJpc3N1ZXJjb3VudHJ5aXNvMmEiOiJVUyIsIm1hc2tlZHBhbiI6IjQxMTExMSMjIyMjIzExMTEiLCJzZWN1cml0eXJlc3BvbnNlcG9zdGNvZGUiOiIwIiwiZW5yb2xsZWQiOiJZIiwic2VjdXJpdHlyZXNwb25zZWFkZHJlc3MiOiIwIiwib3BlcmF0b3JuYW1lIjoibGl2ZTJfYXV0b2p3dCIsInNldHRsZXN0YXR1cyI6IjAifV0sInNlY3JhbmQiOiJJWEhCQ2g5In19.ab4CU-ZiRz1ZbxBISjQfzrQeXULPW2YWdAS4lKPANws';
  const instance = StCodec;
  return { instance, jwt, responseJwt };
}

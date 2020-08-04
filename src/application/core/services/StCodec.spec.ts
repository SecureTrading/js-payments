import each from 'jest-each';
import JwtDecode from 'jwt-decode';
import { Language } from '../shared/Language';
import { StCodec } from './StCodec.class';
import { MessageBus } from '../shared/MessageBus';
import { Translator } from '../shared/Translator';

jest.mock('../../../../src/application/core/shared/MessageBus');
jest.mock('../../../../src/application/core/shared/notification/Notification');

// given
describe('StCodec class', () => {
  const { instance, jwt } = stCodecFixture();
  const ridRegex = 'J-[\\da-z]{8}';
  const requestid = expect.stringMatching(new RegExp('^' + ridRegex + '$'));
  let str: StCodec;

  // @ts-ignore
  StCodec.getNotification().error = jest.fn();
  const fullResponse = {
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjExMTUyMDksInBheWxvYWQiOnsicmVxdWVzdHJlZmVyZW5jZSI6IlczMy0wcm0wZ2N5eCIsInJlc3BvbnNlIjpbeyJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImFjcXVpcmVycmVzcG9uc2Vjb2RlIjoiMDAiLCJhdXRoY29kZSI6IlRFU1Q1NiIsImJhc2VhbW91bnQiOiIxMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwiZGNjZW5hYmxlZCI6IjAiLCJlcnJvcmNvZGUiOiIwIiwiZXJyb3JtZXNzYWdlIjoiT2siLCJpc3N1ZXIiOiJTZWN1cmVUcmFkaW5nIFRlc3QgSXNzdWVyMSIsImlzc3VlcmNvdW50cnlpc28yYSI6IlVTIiwibGl2ZXN0YXR1cyI6IjAiLCJtYXNrZWRwYW4iOiI0MTExMTEjIyMjIyMwMjExIiwibWVyY2hhbnRjb3VudHJ5aXNvMmEiOiJHQiIsIm1lcmNoYW50bmFtZSI6IndlYnNlcnZpY2UgVU5JQ09ERSBtZXJjaGFudG5hbWUiLCJtZXJjaGFudG51bWJlciI6IjAwMDAwMDAwIiwib3BlcmF0b3JuYW1lIjoid2Vic2VydmljZXNAc2VjdXJldHJhZGluZy5jb20iLCJvcmRlcnJlZmVyZW5jZSI6IkFVVEhfVklTQV9QT1NULVBBU1MtSlNPTi1KU09OIiwicGF5bWVudHR5cGVkZXNjcmlwdGlvbiI6IlZJU0EiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9uIjoiQVVUSCIsInNlY3VyaXR5cmVzcG9uc2VhZGRyZXNzIjoiMiIsInNlY3VyaXR5cmVzcG9uc2Vwb3N0Y29kZSI6IjIiLCJzZWN1cml0eXJlc3BvbnNlc2VjdXJpdHljb2RlIjoiMiIsInNldHRsZWR1ZWRhdGUiOiIyMDE5LTAyLTIxIiwic2V0dGxlc3RhdHVzIjoiMCIsInNwbGl0ZmluYWxudW1iZXIiOiIxIiwidGlkIjoiMjc4ODI3ODgiLCJ0cmFuc2FjdGlvbnJlZmVyZW5jZSI6IjMzLTktODAxNjgiLCJ0cmFuc2FjdGlvbnN0YXJ0ZWR0aW1lc3RhbXAiOiIyMDE5LTAyLTIxIDEwOjA2OjM1In1dLCJzZWNyYW5kIjoiWktBVk1za1dRIiwidmVyc2lvbiI6IjEuMDAifX0.lLHIs5UsXht0IyFCGEF_x7AM4u_lOWX47J5cCuakqtc'
  };

  const fullResponseError = {
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjExMTUyMDksInBheWxvYWQiOnsicmVxdWVzdHJlZmVyZW5jZSI6IlczMy0wcm0wZ2N5eCIsInJlc3BvbnNlIjpbeyJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImFjcXVpcmVycmVzcG9uc2Vjb2RlIjoiMDAiLCJhdXRoY29kZSI6IlRFU1Q1NiIsImJhc2VhbW91bnQiOiIxMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwiZGNjZW5hYmxlZCI6IjAiLCJlcnJvcmNvZGUiOiIzMDAwMCIsImVycm9ybWVzc2FnZSI6IkludmFsaWQgZmllbGQiLCJpc3N1ZXIiOiJTZWN1cmVUcmFkaW5nIFRlc3QgSXNzdWVyMSIsImlzc3VlcmNvdW50cnlpc28yYSI6IlVTIiwibGl2ZXN0YXR1cyI6IjAiLCJtYXNrZWRwYW4iOiI0MTExMTEjIyMjIyMwMjExIiwibWVyY2hhbnRjb3VudHJ5aXNvMmEiOiJHQiIsIm1lcmNoYW50bmFtZSI6IndlYnNlcnZpY2UgVU5JQ09ERSBtZXJjaGFudG5hbWUiLCJtZXJjaGFudG51bWJlciI6IjAwMDAwMDAwIiwib3BlcmF0b3JuYW1lIjoid2Vic2VydmljZXNAc2VjdXJldHJhZGluZy5jb20iLCJvcmRlcnJlZmVyZW5jZSI6IkFVVEhfVklTQV9QT1NULVBBU1MtSlNPTi1KU09OIiwicGF5bWVudHR5cGVkZXNjcmlwdGlvbiI6IlZJU0EiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9uIjoiQVVUSCIsInNlY3VyaXR5cmVzcG9uc2VhZGRyZXNzIjoiMiIsInNlY3VyaXR5cmVzcG9uc2Vwb3N0Y29kZSI6IjIiLCJzZWN1cml0eXJlc3BvbnNlc2VjdXJpdHljb2RlIjoiMiIsInNldHRsZWR1ZWRhdGUiOiIyMDE5LTAyLTIxIiwic2V0dGxlc3RhdHVzIjoiMCIsInNwbGl0ZmluYWxudW1iZXIiOiIxIiwidGlkIjoiMjc4ODI3ODgiLCJ0cmFuc2FjdGlvbnJlZmVyZW5jZSI6IjMzLTktODAxNjgiLCJ0cmFuc2FjdGlvbnN0YXJ0ZWR0aW1lc3RhbXAiOiIyMDE5LTAyLTIxIDEwOjA2OjM1In1dLCJzZWNyYW5kIjoiWktBVk1za1dRIiwidmVyc2lvbiI6IjEuMDAifX0.i9YzLn9bQfve_odfCQD4KDchekY_vsDXOiFqZbEb0Jc'
  };

  // given
  describe('StCodec.verifyResponseObject', () => {
    // @ts-ignore
    const originalIsInvalid = StCodec._isInvalidResponse;
    // @ts-ignore
    const originalHandleInvalid = StCodec._handleInvalidResponse;
    // @ts-ignore
    const originalDetermineResp = StCodec._determineResponse;
    // @ts-ignore
    const originalHandleValid = StCodec._handleValidGatewayResponse;

    // when
    beforeEach(() => {
      // @ts-ignore
      StCodec._isInvalidResponse = jest.fn();
      // @ts-ignore
      StCodec._handleInvalidResponse = jest.fn();
      // @ts-ignore
      StCodec._determineResponse = jest.fn();
      // @ts-ignore
      StCodec._handleValidGatewayResponse = jest.fn();
    });

    afterEach(() => {
      // @ts-ignore
      StCodec._isInvalidResponse = originalIsInvalid;
      // @ts-ignore
      StCodec._handleInvalidResponse = originalHandleInvalid;
      // @ts-ignore
      StCodec._determineResponse = originalDetermineResp;
      // @ts-ignore
      StCodec._handleValidGatewayResponse = originalHandleValid;
    });

    // then
    it('handles a valid response', () => {
      // @ts-ignore
      StCodec._isInvalidResponse.mockReturnValueOnce(false);
      // @ts-ignore
      StCodec._determineResponse.mockReturnValueOnce({ determined: 'response' });
      expect(StCodec.verifyResponseObject({ 'a response': 'some data' }, 'ajwtstring')).toMatchObject({
        determined: 'response'
      });
      // @ts-ignore
      expect(StCodec._isInvalidResponse).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(StCodec._determineResponse).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(StCodec._handleValidGatewayResponse).toHaveBeenCalledTimes(1);
    });

    // then
    it('handles an invalid response', () => {
      // @ts-ignore
      StCodec._isInvalidResponse.mockReturnValueOnce(true);
      // @ts-ignore
      StCodec._handleInvalidResponse.mockReturnValue(new Error('Uh oh!'));
      expect(() => StCodec.verifyResponseObject({ 'a response': 'some data' }, 'ajwtstring')).toThrow(
        new Error('Uh oh!')
      );
      // @ts-ignore
      expect(StCodec._isInvalidResponse).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(StCodec._handleInvalidResponse).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('StCodec.publishResponse', () => {
    let translator: Translator;

    //when
    beforeEach(() => {
      // @ts-ignore
      translator = new Translator('en_GB');
      translator.translate = jest.fn().mockReturnValue('Ok');
      // @ts-ignore
      StCodec.getMessageBus().publish = jest.fn();
    });

    // then
    it('should translate and publish result', () => {
      // @ts-ignore
      StCodec.publishResponse({
        errorcode: '0',
        errormessage: 'Payment has been successfully processed'
      });
      // @ts-ignore
      expect(translator.translate()).toEqual('Ok');
      // @ts-ignore
      expect(StCodec.getMessageBus().publish).toHaveBeenCalledWith(
        {
          data: {
            errorcode: '0',
            errormessage: 'Payment has been successfully processed'
          },
          type: 'TRANSACTION_COMPLETE'
        },
        true
      );
    });

    // then
    it('should assing jwtResponse to eventData.jwt when it is defined', () => {
      StCodec.publishResponse(
        {
          errorcode: '0',
          errormessage: 'Ok'
        },
        'someJwtResponse'
      );
      // @ts-ignore
      expect(StCodec.getMessageBus().publish).toHaveBeenCalledTimes(1);
    });

    // then
    it('should assing threedresponse  to eventData.threedresponse  when it is defined', () => {
      StCodec.publishResponse(
        {
          errorcode: '0',
          errormessage: 'Ok'
        },
        'someJwtResponse',
        'someThreedresponse'
      );
      // @ts-ignore
      expect(StCodec.getMessageBus().publish).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('StCodec._createCommunicationError', () => {
    // then
    it('return valid error response', () => {
      // @ts-ignore
      expect(StCodec._createCommunicationError()).toMatchObject({
        errorcode: '50003',
        errormessage: 'Invalid response'
      });
    });
  });

  // given
  describe('StCodec._handleInvalidResponse', () => {
    // then
    it('should call publishResponse and error notification and return the error object', () => {
      let spy1 = jest.spyOn(StCodec, 'publishResponse');
      // @ts-ignore
      let spy2 = jest.spyOn(StCodec.getNotification(), 'error');
      // @ts-ignore
      expect(StCodec._handleInvalidResponse()).toMatchObject(
        new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy1).toHaveBeenCalledWith({ errorcode: '50003', errormessage: 'Invalid response' });
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledWith(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    });
  });

  // given
  describe('StCodec._determineResponse', () => {
    // then
    each([
      [{ response: [{ requesttypedescription: 'AUTH' }] }, { requesttypedescription: 'AUTH' }],
      [
        { response: [{ requesttypedescription: 'AUTH' }, { requesttypedescription: 'CHARGEBACK' }] },
        { requesttypedescription: 'CHARGEBACK' }
      ],
      [
        {
          response: [
            { requesttypedescription: 'AUTH', customeroutput: 'RESULT' },
            { requesttypedescription: 'CHARGEBACK' }
          ]
        },
        { requesttypedescription: 'AUTH', customeroutput: 'RESULT' }
      ],
      [
        {
          response: [
            { requesttypedescription: 'AUTH', customeroutput: 'RESULT' },
            { requesttypedescription: 'RISKDEC' },
            { requesttypedescription: 'CHARGEBACK' }
          ]
        },
        { requesttypedescription: 'AUTH', customeroutput: 'RESULT' }
      ],
      [
        {
          response: [
            { requesttypedescription: 'AUTH' },
            { requesttypedescription: 'RISKDEC', customeroutput: 'RESULT' },
            { requesttypedescription: 'CHARGEBACK' }
          ]
        },
        { requesttypedescription: 'RISKDEC', customeroutput: 'RESULT' }
      ]
    ]).it('should return a valid response ', (requestObject, expected) => {
      // @ts-ignore
      expect(StCodec._determineResponse(requestObject)).toEqual(expected);
    });
  });

  // given
  describe('StCodec._handleValidGatewayResponse', () => {
    const originalPublishResponse = StCodec.publishResponse;
    const originalGetErrorData = StCodec.getErrorData;
    let spy: any;

    // when
    beforeEach(() => {
      StCodec.publishResponse = jest.fn();
      StCodec.getErrorData = jest.fn((data: any) => originalGetErrorData(data));
      // @ts-ignore
      spy = jest.spyOn(StCodec.getNotification(), 'error');
    });

    afterEach(() => {
      StCodec.publishResponse = originalPublishResponse;
      StCodec.getErrorData = originalGetErrorData;
    });

    // then
    it('should handle successful response', () => {
      const content = { errorcode: '0', errormessage: 'Ok', requesttypedescription: 'AUTH' };
      const jwt = 'jwtString';
      // @ts-ignore
      StCodec._handleValidGatewayResponse(content, jwt);
      expect(spy).toHaveBeenCalledTimes(0);
      expect(StCodec.publishResponse).toHaveBeenCalledWith(content, jwt);
      expect(content.errormessage).toBe('Ok');
    });
  });

  // given
  describe('StCodec._decodeResponseJwt', () => {
    // then
    it('should return decoded JWT payload', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwYXlsb2FkIjp7InNvbWV0aGluZyI6InRoYXRzIGRlY29kZWQifX0.OCxORAco0sqzWR1nd4-MUajfrAHGgGSf4d_AAjmrNlU';
      const mock = jest.fn();
      // @ts-ignore
      const resp = StCodec._decodeResponseJwt(jwt, mock);
      expect(resp).toMatchObject({
        iat: 1516239022,
        name: 'John Doe',
        payload: { something: 'thats decoded' },
        sub: '1234567890'
      });
      expect(mock).toHaveBeenCalledTimes(0);
    });

    // then
    it('should call reject on failure', () => {
      const jwt = 'INVALID';
      const mock = jest.fn();
      // @ts-ignore
      StCodec._decodeResponseJwt(jwt, mock);
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
    });
  });

  // given
  describe('StCodec._createRequestId', () => {
    // when
    beforeEach(() => {
      str = new StCodec(jwt);
    });

    // then
    it('generates a request id', () => {
      expect(StCodec._createRequestId()).toEqual(requestid);
    });

    // then
    it('generates reasonably unique ids', () => {
      const attempts = 99999;
      const results = new Set();
      for (let i = 0; i < attempts; i++) {
        results.add(StCodec._createRequestId());
      }
      expect(results.size).toEqual(attempts);
    });
  });

  // given
  describe('StCodec.buildRequestObject', () => {
    // when
    beforeEach(() => {
      str = new StCodec(jwt);
      StCodec.VERSION_INFO = 'STJS::N/A::2.0.0::N/A';
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    // then
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
        acceptcustomeroutput: '1.00',
        jwt,
        request: [{ requestid, ...expected }],
        version: StCodec.VERSION,
        versioninfo: 'STJS::N/A::2.0.0::N/A'
      });
    });
  });

  // given
  describe('StCodec.encode', () => {
    // when
    beforeEach(() => {
      str = new StCodec(jwt);
      StCodec.VERSION_INFO = 'STJS::N/A::2.0.0::N/A';
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    // then
    each([
      [
        { pan: '4111111111111111', requesttypedescriptions: ['AUTH'] },
        expect.stringMatching(
          new RegExp(
            '^{"acceptcustomeroutput":"1.00","jwt":"' +
              jwt +
              '","request":\\[{"pan":"4111111111111111","requesttypedescriptions":\\["AUTH"\\],"requestid":"' +
              ridRegex +
              '","sitereference":"live2"}\\],"version":"1.00","versioninfo":"STJS::N/A::2.0.0::N/A"}$'
          )
        )
      ],
      [
        { pan: '4111111111111111', requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'] },
        expect.stringMatching(
          new RegExp(
            '^{"acceptcustomeroutput":"1.00","jwt":"' +
              jwt +
              '","request":\\[{"pan":"4111111111111111",' +
              '"requesttypedescriptions":\\["AUTH","SUBSCRIPTION"\\],"requestid":"' +
              ridRegex +
              '","sitereference":"live2"}\\],"version":"1.00","versioninfo":"STJS::N/A::2.0.0::N/A"}$'
          )
        )
      ]
    ]).it('should encode valid data', (request, expected) => {
      str.buildRequestObject = jest.fn(str.buildRequestObject);
      expect(str.encode(request)).toEqual(expected);
      expect(str.buildRequestObject).toHaveBeenCalledWith(request);
    });

    //then
    it('should refuse to build a request with an invalid rtd', () => {
      expect(() =>
        str.encode({
          pan: '4111111111111111',
          requesttypedescriptions: ['LARGEHADRONCOLLIDER']
        })
      ).toThrow(Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST));
    });

    // then
    it('should refuse to build a request with if any of the rtd are invalid', () => {
      expect(() =>
        str.encode({
          pan: '4111111111111111',
          requesttypedescriptions: ['AUTH', 'LARGEHADRONCOLLIDER']
        })
      ).toThrow(Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST));
    });
  });

  // given
  describe('StCodec._isInvalidResponse', () => {
    // when
    beforeEach(() => {
      str = new StCodec(jwt);
      // @ts-ignore
      StCodec.publishResponse = jest.fn();
    });

    // then
    each([
      [{}, true],
      [{ response: [{}] }, true],
      [{ version: '3.02' }, true],
      [{ version: '1.00', response: [] }, true],
      [{ version: '1.00', response: [{}] }, false],
      [{ version: '1.00', response: [{}, {}] }, false]
    ]).it('should verify the version and number of responses', (responseData, expected) => {
      // @ts-ignore
      expect(instance._isInvalidResponse(responseData)).toBe(expected);
    });
  });

  // given
  describe('StCodec.decode', () => {
    // when
    beforeEach(() => {
      str = new StCodec(jwt);
      // @ts-ignore
      StCodec._handleInvalidResponse = jest
        .fn()
        .mockReturnValueOnce(Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    // then
    it('should decode a valid response', async () => {
      instance.verifyResponseObject = jest.fn().mockReturnValueOnce({ verified: 'data' });
      await expect(
        str.decode({
          json: () => {
            return new Promise(resolve => resolve(fullResponse));
          }
        })
      ).resolves.toEqual({ jwt: fullResponse.jwt, response: { verified: 'data' } });
      const expectedResult = (JwtDecode(fullResponse.jwt) as any).payload;
      expect(instance.verifyResponseObject).toHaveBeenCalledWith(expectedResult, fullResponse.jwt);
    });

    // then
    it('should error an invalid response', async () => {
      await expect(str.decode({})).rejects.toThrow(Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
      // @ts-ignore
      expect(StCodec._handleInvalidResponse).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('StCodec.updateJWTValue', () => {
    const messageBusEvent = {
      data: {
        newJwt: 'somenewjwt'
      },
      type: MessageBus.EVENTS_PUBLIC.UPDATE_JWT
    };

    // when
    beforeEach(() => {
      // @ts-ignore
      StCodec.getMessageBus().publish = jest.fn();
      StCodec.updateJWTValue('somenewjwt');
    });

    // then
    it('should call publish method with UPDATE_JWT event', () => {
      // @ts-ignore
      expect(StCodec.getMessageBus().publish).toHaveBeenCalledWith(messageBusEvent, true);
    });

    // then
    it('should call publish method with UPDATE_JWT event', () => {
      // @ts-ignore
      expect(StCodec.getMessageBus().publish).toHaveBeenCalledWith(messageBusEvent, true);
    });
  });
});

function stCodecFixture() {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const instance = StCodec;
  const obj: StCodec = new StCodec(jwt);
  return { instance, jwt, obj };
}

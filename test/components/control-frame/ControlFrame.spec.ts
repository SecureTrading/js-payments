import JwtDecode from 'jwt-decode';
import ControlFrame from '../../../src/components/control-frame/ControlFrame';
import { StCodec } from '../../../src/core/classes/StCodec.class';
import Language from '../../../src/core/shared/Language';
import MessageBus from '../../../src/core/shared/MessageBus';

jest.mock('./../../../src/core/shared/Payment');
jest.mock('jwt-decode');

// given
describe('ControlFrame', () => {
  const { data, instance, messageBusEvent } = controlFrameFixture();

  beforeEach(() => {
    // @ts-ignore
    instance.messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
      callback(data);
    });
  });

  // given
  describe('_initChangeCardNumberEvent()', () => {
    // then
    it('should call _onCardNumberStateChange when CHANGE_CARD_NUMBER event has been called', () => {
      // @ts-ignore
      instance._onCardNumberStateChange = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_CARD_NUMBER;
      // @ts-ignore
      instance._initChangeCardNumberEvent();
      // @ts-ignore
      expect(instance._onCardNumberStateChange).toHaveBeenCalled();
    });
  });

  // given
  describe('_onExpirationDateStateChange()', () => {
    // then
    it('should call _onExpirationDateStateChange when CHANGE_EXPIRATION_DATE event has been called', () => {
      // @ts-ignore
      instance._onExpirationDateStateChange = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_EXPIRATION_DATE;
      // @ts-ignore
      instance._initChangeExpirationDateEvent();
      // @ts-ignore
      expect(instance._onExpirationDateStateChange).toHaveBeenCalled();
    });
  });

  // given
  describe('_onSecurityCodeStateChange()', () => {
    // then
    it('should call _onSecurityCodeStateChange when CHANGE_SECURITY_CODE event has been called', () => {
      // @ts-ignore
      instance._onSecurityCodeStateChange = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS.CHANGE_SECURITY_CODE;
      // @ts-ignore
      instance._initChangeSecurityCodeEvent();
      // @ts-ignore
      expect(instance._onSecurityCodeStateChange).toHaveBeenCalled();
    });
  });

  // given
  describe('_initSetRequestTypesEvent()', () => {
    // then
    it('should call _onSetRequestTypesEvent when SET_REQUEST_TYPES event has been called', () => {
      // @ts-ignore
      instance._onSetRequestTypesEvent = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES;
      // @ts-ignore
      instance._initSetRequestTypesEvent();
      // @ts-ignore
      expect(instance._onSetRequestTypesEvent).toHaveBeenCalled();
    });
  });

  // given
  describe('_initByPassInitEvent()', () => {
    // then
    it('should call _onByPassInitEvent when BY_PASS_INIT event has been called', () => {
      // @ts-ignore
      instance._onByPassInitEvent = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.BY_PASS_INIT;
      // @ts-ignore
      instance._initByPassInitEvent();
      // @ts-ignore
      expect(instance._onByPassInitEvent).toHaveBeenCalled();
    });
  });

  // given
  describe('_initThreedinitEvent()', () => {
    // then
    it('should call _onThreeDInitEvent when THREEDINIT event has been called', () => {
      // @ts-ignore
      instance._onThreeDInitEvent = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.THREEDINIT;
      // @ts-ignore
      instance._initThreedinitEvent();
      // @ts-ignore
      expect(instance._onThreeDInitEvent).toHaveBeenCalled();
    });
  });

  // given
  describe('_initLoadCardinalEvent()', () => {
    // then
    it('should call _onLoadCardinal when LOAD_CARDINAL event has been called', () => {
      // @ts-ignore
      instance._onLoadCardinal = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL;
      // @ts-ignore
      instance._initLoadCardinalEvent();
      // @ts-ignore
      expect(instance._onLoadCardinal).toHaveBeenCalled();
    });
  });

  // given
  describe('_initProcessPaymentsEvent()', () => {
    // then
    it('should call _onProcessPaymentEvent when PROCESS_PAYMENTS event has been called', () => {
      // @ts-ignore
      instance._onProcessPaymentEvent = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS;
      // @ts-ignore
      instance._initProcessPaymentsEvent();
      // @ts-ignore
      expect(instance._onProcessPaymentEvent).toHaveBeenCalled();
    });
  });

  // given
  describe('_initSubmitFormEvent()', () => {
    // then
    it('should call _onSubmit when SUBMIT_FORM event has been called', () => {
      // @ts-ignore
      instance._onSubmit = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.SUBMIT_FORM;
      // @ts-ignore
      instance._initSubmitFormEvent();
      // @ts-ignore
      expect(instance._onSubmit).toHaveBeenCalled();
    });
  });

  // given
  describe('_initUpdateMerchantFieldsEvent()', () => {
    // then
    it('should call _storeMerchantData when UPDATE_MERCHANT_FIELDS event has been called', () => {
      // @ts-ignore
      instance._storeMerchantData = jest.fn();
      messageBusEvent.type = MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS;
      // @ts-ignore
      instance._initUpdateMerchantFieldsEvent();
      // @ts-ignore
      expect(instance._storeMerchantData).toHaveBeenCalled();
    });
  });

  // given
  describe('_initResetJwtEvent()', () => {
    const obj = { data: { newJwt: 'some jwt' } };

    // then
    it('should call _initResetJwtEvent when RESET_JWT event has been called', () => {
      // @ts-ignore
      instance.messageBus.subscribe = jest
        .fn()
        .mockImplementationOnce((even, callback) => {
          callback();
        })
        .mockImplementationOnce((even, callback) => {
          callback(obj);
        });
      // @ts-ignore
      instance._onLoad = jest.fn();

      // @ts-ignore
      instance._initResetJwtEvent();
      // @ts-ignore
      expect(instance._onLoad).toHaveBeenCalled();
    });
  });

  // given
  describe('_onCardNumberStateChange', () => {
    const { instance } = controlFrameFixture();
    const formFieldState = {
      validity: true,
      value: '4111'
    };

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onCardNumberStateChange(formFieldState);
    });

    // then
    it('should set validity and value params of this._formFields.cardNumber', () => {
      // @ts-ignore
      expect(instance._formFields.cardNumber.validity).toEqual(formFieldState.validity);
      // @ts-ignore
      expect(instance._formFields.cardNumber.value).toEqual(formFieldState.value);
    });
  });

  // given
  describe('_onExpirationDateStateChange', () => {
    const { instance } = controlFrameFixture();
    const formFieldState = {
      validity: true,
      value: '01/2'
    };

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onExpirationDateStateChange(formFieldState);
    });

    // then
    it('should set validity and value params of this._formFields.expirationDate', () => {
      // @ts-ignore
      expect(instance._formFields.expirationDate.validity).toEqual(formFieldState.validity);
      // @ts-ignore
      expect(instance._formFields.expirationDate.value).toEqual(formFieldState.value);
    });
  });

  // given
  describe('_onSecurityCodeStateChange', () => {
    const { instance } = controlFrameFixture();
    const formFieldState = {
      validity: true,
      value: '12'
    };

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onSecurityCodeStateChange(formFieldState);
    });

    // then
    it('should set validity and value params of this._formFields.securityCode', () => {
      // @ts-ignore
      expect(instance._formFields.securityCode.validity).toEqual(formFieldState.validity);
      // @ts-ignore
      expect(instance._formFields.securityCode.value).toEqual(formFieldState.value);
    });
  });

  // given
  describe('_onSetRequestTypesEvent', () => {
    const { instance } = controlFrameFixture();
    const data = { requestTypes: ['JSINIT', 'THREEDQUERY', 'CACHETOKENISE', 'AUTH'] };

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onSetRequestTypesEvent(data);
    });

    // then
    it('should set _preThreeDRequestTypes and _postThreeDRequestTypes ', () => {
      // @ts-ignore
      expect(instance._preThreeDRequestTypes).toEqual(['JSINIT', 'THREEDQUERY']);
      // @ts-ignore
      expect(instance._postThreeDRequestTypes).toEqual(['CACHETOKENISE', 'AUTH']);
    });
  });

  // given
  describe('_onSubmit', () => {
    const { instance } = controlFrameFixture();
    const data = { requestTypes: ['JSINIT', 'THREEDQUERY', 'CACHETOKENISE', 'AUTH'] };

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._requestPayment = jest.fn();
      // @ts-ignore
      instance._onSetRequestTypesEvent = jest.fn();
      // @ts-ignore
      instance._onSubmit(data);
    });

    //then
    it('should call _requestPayment', () => {
      // @ts-ignore
      expect(instance._requestPayment).toHaveBeenCalledWith(data);
    });

    //then
    it('should call _onSetRequestTypesEvent when data is not undefined and data.requestTypes is not undefined', () => {
      // @ts-ignore
      expect(instance._onSetRequestTypesEvent).toHaveBeenCalledWith(data);
    });
  });

  // given
  describe('_onLoadCardinal', () => {
    const { instance } = controlFrameFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onLoadCardinal();
    });

    // then
    it('should set _isPaymentReady to true', () => {
      // @ts-ignore
      expect(instance._isPaymentReady).toEqual(true);
    });
  });

  // given
  describe('_onThreeDInitEvent', () => {
    const { instance } = controlFrameFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._requestThreeDInit = jest.fn();
      // @ts-ignore
      instance._onThreeDInitEvent();
    });

    // then
    it('should call _requestThreeDInit', () => {
      // @ts-ignore
      expect(instance._requestThreeDInit).toHaveBeenCalled();
    });
  });

  // given
  describe('_onByPassInitEvent', () => {
    const { instance } = controlFrameFixture();
    const cachetoken = '893h12und9n283n923';

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._requestByPassInit = jest.fn();
      // @ts-ignore
      instance._onByPassInitEvent(cachetoken);
    });

    // then
    it('should call _requestThreeDInit', () => {
      // @ts-ignore
      expect(instance._requestByPassInit).toHaveBeenCalledWith(cachetoken);
    });
  });

  // given
  describe('_onProcessPaymentEvent', () => {
    const { instance } = controlFrameFixture();
    const data = {
      errorcode: '40005',
      errormessage: 'some error message'
    };

    const postRequests = ['CACHETOKENISE', 'AUTH'];

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._processThreeDResponse = jest.fn();
      // @ts-ignore
      instance._processPayment = jest.fn();
    });

    // then
    it('should call _processThreeDResponse if _postThreeDRequestTypes has no requests included', () => {
      // @ts-ignore
      instance._postThreeDRequestTypes = [];
      // @ts-ignore
      instance._onProcessPaymentEvent(data);
      // @ts-ignore
      expect(instance._processThreeDResponse).toHaveBeenCalledWith(data);
    });

    // then
    it('should call _requestThreeDInit if _postThreeDRequestTypes has some requests', () => {
      // @ts-ignore
      instance._postThreeDRequestTypes = postRequests;
      // @ts-ignore
      instance._onProcessPaymentEvent(data);
      // @ts-ignore
      expect(instance._processPayment).toHaveBeenCalledWith(data);
    });
  });

  // given
  describe('_processThreeDResponse', () => {
    const { instance } = controlFrameFixture();
    const data = {
      errorcode: '40005',
      errormessage: 'some error message'
    };
    const dataWithThreedresponse = {
      ...data,
      threedresponse: '31232312321'
    };

    beforeEach(() => {
      // @ts-ignore
      instance._notification.success = jest.fn();
      // @ts-ignore
      instance._threeDQueryResult = { response: 'someresponse' };
      StCodec.publishResponse = jest.fn();
    });

    // then
    it('should call publishResponse if threedresponse is defined', () => {
      // @ts-ignore
      instance._processThreeDResponse(dataWithThreedresponse);
      // @ts-ignore
      expect(StCodec.publishResponse).toHaveBeenCalled();
    });

    // then
    it('should call notification success, no matter if threedresponse is in data', () => {
      // @ts-ignore
      instance._processThreeDResponse(data);
      // @ts-ignore
      expect(instance._notification.success).toHaveBeenCalledWith(Language.translations.PAYMENT_SUCCESS);
    });
  });

  // TODO: get know how handle this promise
  // given
  describe('_processPayment', () => {
    const { instance } = controlFrameFixture();
    const data = {
      errorcode: '40005',
      errormessage: 'some error message'
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._notification.success = jest.fn();
      // @ts-ignore
      instance._notification.error = jest.fn();
      // @ts-ignore
      instance._validation.blockForm = jest.fn();
    });
    // then
    it('should call notification success when promise is resolved', async () => {
      // @ts-ignore
      instance._payment.processPayment = jest.fn().mockResolvedValueOnce(new Promise(resolve => resolve()));
      // @ts-ignore
      instance._processPayment(data);
    });

    // then
    it('should call notification error when promise is rejected', async () => {
      // @ts-ignore
      instance._payment.processPayment = jest.fn().mockRejectedValueOnce(new Promise(rejected => rejected()));
      // @ts-ignore
      instance._processPayment(data);
    });
  });

  // given
  describe('_requestByPassInit', () => {
    const { instance } = controlFrameFixture();
    const cachetoken = 'somecachetoken1234';
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._requestByPassInit(cachetoken);
    });

    // then
    it('should call byPassInitRequest', () => {
      // @ts-ignore
      expect(instance._payment.byPassInitRequest).toHaveBeenCalledWith(cachetoken);
    });
  });

  // given
  describe('_requestThreeDInit', () => {
    const { instance } = controlFrameFixture();
    const result = {
      response: {}
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._payment.threeDInitRequest = jest.fn().mockImplementation(() => Promise.resolve(result));
      // @ts-ignore
      instance._requestThreeDInit();
    });
    // then
    it('should call _threeDInitRequest()', () => {
      // @ts-ignore
      expect(instance._payment.threeDInitRequest).toBeCalled();
    });
  });

  // given
  describe('_storeMerchantData', () => {
    const { instance } = controlFrameFixture();
    const data = 'some data';

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._storeMerchantData(data);
      // @ts-ignore
      instance.messageBus.publish = jest.fn();
    });

    // then
    it('should set _merchantFormData', () => {
      // @ts-ignore
      expect(instance._merchantFormData).toEqual(data);
    });
  });

  // given
  describe('_onResetJWT', () => {
    // when
    beforeEach(() => {
      StCodec.originalJwt = '56789';
      StCodec.jwt = '1234';
      // @ts-ignore
      ControlFrame._onResetJWT();
    });
    // then
    it('should set STCodec.jwt', () => {
      // @ts-ignore
      expect(StCodec.jwt).toEqual(StCodec.originalJwt);
    });
  });

  // given
  describe('_onUpdateJWT', () => {
    // when
    beforeEach(() => {
      StCodec.jwt = '1234';
      StCodec.originalJwt = '56789';
      // @ts-ignore
      ControlFrame._onUpdateJWT('997');
    });

    // then
    it('should update jwt and originalJwt', () => {
      expect(StCodec.jwt).toEqual('997');
      expect(StCodec.originalJwt).toEqual('997');
    });
  });
});

function controlFrameFixture() {
  const instance = new ControlFrame();
  const messageBusEvent = {
    type: ''
  };
  const data = {
    validity: true,
    value: 'test value'
  };
  return { data, instance, messageBusEvent };
}

import ControlFrame from '../../../src/components/control-frame/ControlFrame';
import { StCodec } from '../../../src/core/classes/StCodec.class';
import Language from '../../../src/core/shared/Language';
import SpyInstance = jest.SpyInstance;

jest.mock('./../../../src/core/shared/Payment');

// given
describe('ControlFrame', () => {
  // given
  describe('_initSubscriptions', () => {});

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

  // given
  describe('_processPayment', () => {});

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
  describe('_requestPayment', () => {});

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
      instance._messageBus.publish = jest.fn();
    });

    // then
    it('should set _merchantFormData', () => {
      // @ts-ignore
      expect(instance._merchantFormData).toEqual(data);
    });
  });
});

function controlFrameFixture() {
  const instance = new ControlFrame();
  return { instance };
}

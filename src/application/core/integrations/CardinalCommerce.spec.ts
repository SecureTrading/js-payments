import each from 'jest-each';
import SpyInstance = jest.SpyInstance;
import { CardinalCommerce } from './CardinalCommerce';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { MessageBus } from '../shared/MessageBus';
import { DomMethods } from '../shared/DomMethods';
import { Selectors } from '../shared/Selectors';
import { Container } from 'typedi';
import { of } from 'rxjs';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { mock, instance as mockInstance, when, anyString } from 'ts-mockito';

jest.mock('../../../../src/application/core/shared/MessageBus');
jest.mock('../../../../src/application/core/integrations/GoogleAnalytics');
jest.mock('../../../../src/client/classes/notification/NotificationService');

// given
describe('CardinalCommerce', () => {
  let instance: any;
  const { jwt } = CardinalCommerceFixture();
  const framesHub: FramesHub = mock(FramesHub);

  // when
  beforeEach(() => {
    when(framesHub.waitForFrame(anyString())).thenCall(name => of(name));

    document.body.innerHTML = `<iframe id='st-control-frame-iframe'>
    </iframe><input id='JWTContainer' value="${jwt}" />`;
    instance = new CardinalCommerce(false, jwt, ['THREEDQUERY', 'AUTH'], 0);
    instance._framesHub = mockInstance(framesHub);
  });

  // given
  describe('_onCardinalSetupComplete()', () => {
    // given
    describe('_startOnLoad False', () => {
      // then
      it('should subscribe method be called once', () => {
        const messageBus = Container.get(MessageBus);
        const spySubscribe: SpyInstance = jest.spyOn(messageBus, 'subscribe');
        const spyPublish: SpyInstance = jest.spyOn(messageBus, 'publish');
        instance.messageBus = messageBus;
        instance._onCardinalSetupComplete();
        expect(spySubscribe).toHaveBeenCalled();
        expect(spyPublish).toHaveBeenCalled();
      });
    });

    // given
    describe('_startOnLoad True', () => {
      // then
      it('should subscribe method be called once', () => {
        instance._startOnLoad = true;
        const messageBus = Container.get(MessageBus);
        // this JWT contains a 'pan'
        instance._jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU4NTUxMjA3LjEzNTU5NTMsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjQwMDAwMDAwMDAwMDEwMDAiLCJleHBpcnlkYXRlIjoiMDEvMjIiLCJzZWN1cml0eWNvZGUiOiIxMjMifX0.V_-f5m35ADC4Y9t17mZjaHgNt_0GXMqPhxJWohAYwSA';
        instance._performBinDetection = jest.fn();
        const spyPublish: SpyInstance = jest.spyOn(messageBus, 'publish');
        instance.messageBus = messageBus;
        instance._onCardinalSetupComplete();
        expect(instance._performBinDetection).toHaveBeenCalledWith('4000000000001000');
        expect(spyPublish).toHaveBeenCalledWith({
          data: { dataInJwt: true, requestTypes: ['THREEDQUERY', 'AUTH'] },
          type: 'SUBMIT_FORM'
        });
      });
    });
  });

  // given
  describe('_performBinDetection()', () => {
    // then
    it('should call cardinal bin process', () => {
      const { CardinalMock } = CardinalCommerceFixture();
      // @ts-ignore
      global.Cardinal = CardinalMock;
      instance._performBinDetection({ value: '411111' });
      expect(CardinalMock.trigger).toHaveBeenCalledTimes(1);
      expect(CardinalMock.trigger).toHaveBeenCalledWith('bin.process', { value: '411111' });
    });
  });

  // given
  describe('_onCardinalValidated()', () => {
    // then
    it('should authorise if successful', () => {
      const spyAuthorize: SpyInstance = jest.spyOn(instance, '_authorizePayment');
      instance._onCardinalValidated({ ActionCode: 'SUCCESS', ErrorNumber: '0' }, 'JWT_VALUE');
      expect(spyAuthorize).toHaveBeenCalled();
      expect(spyAuthorize).toHaveBeenCalledWith({ threedresponse: 'JWT_VALUE' });
    });

    // then
    it('should not authorise if not successful', () => {
      const spyAuthorize: SpyInstance = jest.spyOn(instance, '_authorizePayment');
      instance._onCardinalValidated({ ActionCode: 'ERROR', ErrorNumber: '30000' }, 'JWT_VALUE');
      expect(spyAuthorize).toHaveBeenCalledTimes(0);
    });
  });

  // given
  describe('_authenticateCard()', () => {
    // then
    it('should call cardinal continue', () => {
      const { CardinalMock } = CardinalCommerceFixture();
      // @ts-ignore
      global.Cardinal = CardinalMock;
      instance._cardinalCommerceJWT = jwt;
      instance._authenticateCard({
        acquirertransactionreference: 'cardinal-tx-id',
        acsurl: 'https://example.com',
        enrolled: 'Y',
        threedpayload: 'CARDINAL_ACS_RESPONSE',
        transactionreference: '1-2-3'
      });
      expect(CardinalMock.continue).toHaveBeenCalled();
      expect(CardinalMock.continue).toHaveBeenCalledWith(
        'cca',
        { AcsUrl: 'https://example.com', Payload: 'CARDINAL_ACS_RESPONSE' },
        { Cart: [], OrderDetails: { TransactionId: 'cardinal-tx-id' } },
        jwt
      );
    });
  });

  // given
  describe('_onCardinalLoad()', () => {
    // then
    it('should call cardinal methods to setup callbacks and setup process', () => {
      const { CardinalMock } = CardinalCommerceFixture();
      // @ts-ignore
      global.Cardinal = CardinalMock;
      instance._cardinalCommerceJWT = jwt;
      instance._onCardinalLoad();
      expect(CardinalMock.configure).toHaveBeenCalledTimes(1);
      expect(CardinalMock.configure).toHaveBeenCalledWith({
        logging: {
          level: 'on'
        }
      });
      expect(CardinalMock.on).toHaveBeenCalledTimes(2);
      expect(CardinalMock.on.mock.calls[0][0]).toBe('payments.setupComplete');
      // Annonymous function so can't test using toHaveBeenCalledWith
      expect(CardinalMock.on.mock.calls[0][1]).toBeInstanceOf(Function);
      expect(CardinalMock.on.mock.calls[0].length).toBe(2);

      expect(CardinalMock.on.mock.calls[1][0]).toBe('payments.validated');
      // Annonymous function so can't test using toHaveBeenCalledWith
      expect(CardinalMock.on.mock.calls[1][1]).toBeInstanceOf(Function);
      expect(CardinalMock.on.mock.calls[1].length).toBe(2);

      expect(CardinalMock.setup).toHaveBeenCalledTimes(1);
      expect(CardinalMock.setup).toHaveBeenCalledWith('init', {
        jwt
      });
    });

    // then
    it('should call _onCardinalSetupComplete in SETUP_COMPLETE event', () => {
      const { CardinalMock } = CardinalCommerceFixture();
      instance._onCardinalSetupComplete = jest.fn();
      instance._onCardinalValidated = jest.fn();
      CardinalMock.on = jest.fn((evType, callback) => {
        if (evType === 'payments.setupComplete') {
          callback();
        }
      });
      // @ts-ignore
      global.Cardinal = CardinalMock;
      instance._onCardinalLoad();
      expect(instance._onCardinalSetupComplete).toHaveBeenCalledTimes(1);
      expect(instance._onCardinalSetupComplete).toHaveBeenCalledWith();
      expect(instance._onCardinalValidated).toHaveBeenCalledTimes(0);
    });

    // then
    it('should call _onCardinalValidated in SETUP_COMPLETE event', () => {
      let { CardinalMock } = CardinalCommerceFixture();
      instance._onCardinalSetupComplete = jest.fn();
      instance._onCardinalValidated = jest.fn();
      CardinalMock.on = jest.fn((evType, callback) => {
        if (evType === 'payments.validated') {
          callback('someData', 'someJWT');
        }
      });
      // @ts-ignore
      global.Cardinal = CardinalMock;
      instance._onCardinalLoad();
      expect(instance._onCardinalSetupComplete).toHaveBeenCalledTimes(0);
      expect(instance._onCardinalValidated).toHaveBeenCalledTimes(1);
      expect(instance._onCardinalValidated).toHaveBeenCalledWith('someData', 'someJWT');
    });
  });

  // given
  describe('_initSubscriptions()', () => {
    // then
    it('should set up subscribers to control frame setup, threedquery and threedinit events', () => {
      instance.messageBus.subscribe = jest.fn();
      instance._initSubscriptions();
      expect(instance.messageBus.subscribe.mock.calls.length).toBe(5);
      expect(instance.messageBus.subscribe.mock.calls[0][0]).toBe('LOAD_CONTROL_FRAME');
      // Annonymous function so can't test using toHaveBeenCalledWith
      expect(instance.messageBus.subscribe.mock.calls[0][1]).toBeInstanceOf(Function);
      expect(instance.messageBus.subscribe.mock.calls[0].length).toBe(2);
      expect(instance.messageBus.subscribe.mock.calls[1][0]).toBe('THREEDINIT_RESPONSE');
      // Annonymous function so can't test using toHaveBeenCalledWith
      expect(instance.messageBus.subscribe.mock.calls[1][1]).toBeInstanceOf(Function);
      expect(instance.messageBus.subscribe.mock.calls[1].length).toBe(2);
      expect(instance.messageBus.subscribe.mock.calls[2][0]).toBe('BY_PASS_INIT');
      // Annonymous function so can't test using toHaveBeenCalledWith
      expect(instance.messageBus.subscribe.mock.calls[2][1]).toBeInstanceOf(Function);
      expect(instance.messageBus.subscribe.mock.calls[2].length).toBe(2);
      expect(instance.messageBus.subscribe.mock.calls[3][0]).toBe('THREEDQUERY');
    });

    // then
    it('should call _onLoadControlFrame if eventType is LOAD_CONTROL_FRAME', () => {
      instance._onLoadControlFrame = jest.fn();
      instance._onThreeDInitEvent = jest.fn();
      instance._onThreeDQueryEvent = jest.fn();
      instance.messageBus.subscribe = jest.fn((eventType, callback) => {
        if (eventType === 'LOAD_CONTROL_FRAME') {
          callback();
        }
      });
      instance._initSubscriptions();
      expect(instance._onLoadControlFrame).toHaveBeenCalledTimes(1);
      expect(instance._onLoadControlFrame).toHaveBeenCalledWith();
      expect(instance._onThreeDInitEvent).toHaveBeenCalledTimes(0);
      expect(instance._onThreeDQueryEvent).toHaveBeenCalledTimes(0);
    });

    // then
    it('should call _onThreeDInitEvent if eventType is THREEDINIT_RESPONSE', () => {
      instance._onLoadControlFrame = jest.fn();
      instance._onThreeDInitEvent = jest.fn();
      instance._onThreeDQueryEvent = jest.fn();
      instance.messageBus.subscribe = jest.fn((eventType, callback) => {
        if (eventType === 'THREEDINIT_RESPONSE') {
          callback({ myData: 'SOMETHING' });
        }
      });
      instance._initSubscriptions();
      expect(instance._onLoadControlFrame).toHaveBeenCalledTimes(0);
      expect(instance._onThreeDInitEvent).toHaveBeenCalledTimes(1);
      expect(instance._onThreeDInitEvent).toHaveBeenCalledWith({ myData: 'SOMETHING' });
      expect(instance._onThreeDQueryEvent).toHaveBeenCalledTimes(0);
    });

    // then
    it('should call _onBypassJsInitEvent if eventType is BY_PASS_INIT', () => {
      instance._onLoadControlFrame = jest.fn();
      instance._onThreeDInitEvent = jest.fn();
      instance._onBypassJsInitEvent = jest.fn();
      instance._onThreeDQueryEvent = jest.fn();
      instance.messageBus.subscribe = jest.fn((eventType, callback) => {
        if (eventType === 'BY_PASS_INIT') {
          callback();
        }
      });
      instance._initSubscriptions();
      expect(instance._onBypassJsInitEvent).toHaveBeenCalledTimes(1);
    });

    // then
    it('should call _onThreeDQueryEvent if eventType is THREEDQUERY', () => {
      instance._onLoadControlFrame = jest.fn();
      instance._onThreeDInitEvent = jest.fn();
      instance._onThreeDQueryEvent = jest.fn();
      instance.messageBus.subscribe = jest.fn((eventType, callback) => {
        if (eventType === 'THREEDQUERY') {
          callback({ myData: 'SOMETHING' });
        }
      });
      instance._initSubscriptions();
      expect(instance._onLoadControlFrame).toHaveBeenCalledTimes(0);
      expect(instance._onThreeDInitEvent).toHaveBeenCalledTimes(0);
      expect(instance._onThreeDQueryEvent).toHaveBeenCalledTimes(1);
      expect(instance._onThreeDQueryEvent).toHaveBeenCalledWith({ myData: 'SOMETHING' });
    });
  });

  // given
  describe('_onInit()', () => {
    // then
    it('should set up subscribers', () => {
      instance._initSubscriptions = jest.fn();
      instance._onInit();
      expect(instance._initSubscriptions).toHaveBeenCalledTimes(1);
      expect(instance._initSubscriptions).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_onLoadControlFrame()', () => {
    // then
    it('should set up subscribers', () => {
      instance._threeDInitRequest = jest.fn();
      instance._onLoadControlFrame();
      expect(instance._threeDInitRequest).toHaveBeenCalledTimes(1);
      expect(instance._threeDInitRequest).toHaveBeenCalledWith();
    });
  });

  // given
  describe('_onThreeDInitEvent()', () => {
    // then
    it('should set instance variables and call setup', () => {
      instance._threeDSetup = jest.fn();
      instance._onThreeDInitEvent({ threedinit: 'initValue', cachetoken: 'tokenValue' });
      expect(instance._threeDSetup).toHaveBeenCalledTimes(1);
      expect(instance._threeDSetup).toHaveBeenCalledWith();
      expect(instance._cardinalCommerceJWT).toBe('initValue');
      expect(instance._cardinalCommerceCacheToken).toBe('tokenValue');
    });
  });

  // given
  describe('_onThreeDQueryEvent()', () => {
    // then
    it('should send THREEDQUERY request', () => {
      instance._threeDQueryRequest = jest.fn();
      instance._onThreeDQueryEvent({ 'some data': 'with value' });
      expect(instance._threeDQueryRequest).toHaveBeenCalledTimes(1);
      expect(instance._threeDQueryRequest).toHaveBeenCalledWith({ 'some data': 'with value' });
    });
  });

  // given
  describe('_threeDInitRequest()', () => {
    // then
    it('should publish control iframe event', () => {
      instance.messageBus.publish = jest.fn();
      instance._threeDInitRequest();
      expect(instance.messageBus.publish).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publish).toHaveBeenCalledWith({ type: 'THREEDINIT_REQUEST' });
    });
  });

  // given
  describe('_threeDSetup()', () => {
    // then
    it.skip('should load cardinal javascript', () => {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://example.com');
      script.addEventListener = jest.fn();
      DomMethods.insertScript = jest.fn().mockReturnValueOnce(script);

      instance._threeDSetup();
      expect(DomMethods.insertScript).toHaveBeenCalledTimes(1);
      expect(DomMethods.insertScript).toHaveBeenCalledWith('head', {
        id: 'cardinalCommerce',
        src: 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js'
      });
      expect(script.addEventListener).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(script.addEventListener.mock.calls[0][0]).toBe('load');
      // Annonymous function so can't test using toHaveBeenCalledWith
      // @ts-ignore
      expect(script.addEventListener.mock.calls[0][1]).toBeInstanceOf(Function);
    });
  });

  // given
  describe('_threeDQueryRequest()', () => {
    // @ts-ignore
    const original = CardinalCommerce._isCardEnrolledAndNotFrictionless;

    afterEach(() => {
      // @ts-ignore
      CardinalCommerce._isCardEnrolledAndNotFrictionless = original;
    });

    // then
    it('should authenticate card if enrolled or frictionless', () => {
      // @ts-ignore
      CardinalCommerce._isCardEnrolledAndNotFrictionless = jest.fn().mockReturnValueOnce(true);
      instance._authenticateCard = jest.fn();
      instance._authorizePayment = jest.fn();
      instance._threeDQueryRequest({ transactionreference: '1-2-3' });
      expect(instance._authenticateCard).toHaveBeenCalledTimes(1);
      expect(instance._authorizePayment).toHaveBeenCalledTimes(0);
    });

    // then
    it('should authorise payment if NOT (enrolled or frictionless)', () => {
      // @ts-ignore
      CardinalCommerce._isCardEnrolledAndNotFrictionless = jest.fn().mockReturnValueOnce(false);
      instance._authenticateCard = jest.fn();
      instance._authorizePayment = jest.fn();
      instance._threeDQueryRequest({ transactionreference: '1-2-3' });
      expect(instance._authenticateCard).toHaveBeenCalledTimes(0);
      expect(instance._authorizePayment).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('CardinalCommerce._isCardEnrolledAndNotFrictionless()', () => {
    // then
    each([
      ['Y', undefined, false],
      ['Y', 'https://example.com', true],
      ['N', 'https://example.com', false],
      ['N', undefined, false]
    ]).it(
      'should detect if card is enrolled and we did not get a frictionless 3DS 2.0 response',
      async (enrolled, acsurl, expected) => {
        const response: IThreeDQueryResponse = {
          acquirertransactionreference: 'tx-ref',
          acsurl,
          enrolled,
          threedpayload: 'payload',
          transactionreference: '1-2-3'
        };
        // @ts-ignore
        expect(CardinalCommerce._isCardEnrolledAndNotFrictionless(response)).toBe(expected);
      }
    );
  });

  // given
  describe('_authorizePayment()', () => {
    // then
    it('should publish control iframe event with AUTH', () => {
      instance.messageBus.publish = jest.fn();
      instance._cardinalCommerceCacheToken = 'tokenValue';
      instance._authorizePayment({ some: 'value', cachetoken: 'OVERRIDDEN' });
      expect(instance.messageBus.publish).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publish).toHaveBeenCalledWith({
        type: 'PROCESS_PAYMENTS',
        data: { some: 'value', cachetoken: 'tokenValue' }
      });
    });
    // then
    it('should publish control iframe event with AUTH with no data', () => {
      instance.messageBus.publish = jest.fn();
      instance._cardinalCommerceCacheToken = 'tokenValue';
      instance._authorizePayment();
      expect(instance.messageBus.publish).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publish).toHaveBeenCalledWith({
        type: 'PROCESS_PAYMENTS',
        data: { cachetoken: 'tokenValue' }
      });
    });
    // then
    it('should publish control iframe event with CACHETOKENISE', () => {
      instance.messageBus.publish = jest.fn();
      instance._tokenise = true;
      instance._cardinalCommerceCacheToken = 'tokenValue';
      instance._authorizePayment({ some: 'value', cachetoken: 'OVERRIDDEN' });
      expect(instance.messageBus.publish).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publish).toHaveBeenCalledWith({
        type: 'PROCESS_PAYMENTS',
        data: { some: 'value', cachetoken: 'tokenValue' }
      });
    });
  });

  // given
  describe('_bypassInitRequest()', () => {
    const messageBusEvent = {
      data: 'HowmuchisttheFish?:)',
      type: MessageBus.EVENTS_PUBLIC.BY_PASS_INIT
    };

    // when
    beforeEach(() => {
      instance.messageBus.publish = jest.fn();
      instance._cachetoken = 'HowmuchisttheFish?:)';
      instance._bypassInitRequest();
    });

    // then
    it('should call publish', () => {
      expect(instance.messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  // given
  describe('_onBypassJsInitEvent()', () => {
    // when
    beforeEach(() => {
      instance._threedinit = 'Hyperhyper';
      instance._cachetoken = 'HowmuchisttheFish?:)';
      instance._threeDSetup = jest.fn();
      instance._onBypassJsInitEvent();
    });

    // then
    it('should call publish', () => {
      expect(instance._threeDSetup).toHaveBeenCalled();
    });

    // then
    it('should set both _cardinalCommerceJWT  and _cardinalCommerceCacheToken ', () => {
      expect(instance._cardinalCommerceJWT).toEqual('Hyperhyper');
      expect(instance._cardinalCommerceCacheToken).toEqual('HowmuchisttheFish?:)');
    });
  });

  // given
  describe('_onLoadControlFrame()', () => {
    // when
    beforeEach(() => {
      instance._bypassInitRequest = jest.fn();
      instance._threeDInitRequest = jest.fn();
    });

    // then
    it('should call _bypassInitRequest if _cachetoken is defined', () => {
      instance._cachetoken = 'HowmuchisttheFish?:)';
      instance._onLoadControlFrame();
      expect(instance._bypassInitRequest).toHaveBeenCalled();
    });

    // then
    it('should call _threeDInitRequest if _cachetoken is not defined', () => {
      instance._cachetoken = undefined;
      instance._onLoadControlFrame();
      expect(instance._threeDInitRequest).toHaveBeenCalled();
    });
  });

  // given
  describe('_publishRequestTypesEvent()', () => {
    let element: HTMLIFrameElement;
    const requestTypes: string[] = ['AUTH', 'WALLETVERIFY'];
    const messageBusEvent = {
      data: { requestTypes },
      type: MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES
    };
    let spyPublish: SpyInstance;
    // when
    beforeEach(() => {
      element = document.createElement('iframe');
      element.setAttribute('id', Selectors.CONTROL_FRAME_IFRAME);
      document.getElementById(Selectors.CONTROL_FRAME_IFRAME).addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback();
        });
      spyPublish = jest.spyOn(instance.messageBus, 'publish');
    });

    // then
    it('should call messageBus.publish', () => {
      instance._publishRequestTypesEvent(requestTypes);
      expect(spyPublish).toHaveBeenCalledWith(messageBusEvent);
    });
  });
});

function CardinalCommerceFixture() {
  class CardinalMock {
    static continue = jest.fn();
    static configure = jest.fn();
    static on = jest.fn();
    static off = jest.fn();
    static setup = jest.fn();
    static trigger = jest.fn();
  }

  const validationData: object = {
    ActionCode: 'ERROR',
    ErrorDescription: 'Invalid JWT. Error verifying and deserialize JWT.',
    ErrorNumber: 1020,
    Validated: false
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU3NDIzNDgyLjk0MzE1MywicGF5bG9hZCI6eyJjdXN0b21lcnRvd24iOiJCYW5nb3IiLCJiaWxsaW5ncG9zdGNvZGUiOiJURTEyIDNTVCIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJjdXN0b21lcnByZW1pc2UiOiIxMiIsImJpbGxpbmdsYXN0bmFtZSI6Ik5hbWUiLCJsb2NhbGUiOiJlbl9HQiIsImJhc2VhbW91bnQiOiIxMDAwIiwiYmlsbGluZ2VtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImJpbGxpbmdwcmVtaXNlIjoiMTIiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImJpbGxpbmdzdHJlZXQiOiJUZXN0IHN0cmVldCIsImN1c3RvbWVyc3RyZWV0IjoiVGVzdCBzdHJlZXQiLCJjdXN0b21lcnBvc3Rjb2RlIjoiVEUxMiAzU1QiLCJjdXN0b21lcmxhc3RuYW1lIjoiTmFtZSIsImJpbGxpbmd0ZWxlcGhvbmUiOiIwMTIzNCAxMTEyMjIiLCJiaWxsaW5nZmlyc3RuYW1lIjoiVGVzdCIsImJpbGxpbmd0b3duIjoiQmFuZ29yIiwiYmlsbGluZ3RlbGVwaG9uZXR5cGUiOiJNIn19.08q3gem0kW0eODs5iGQieKbpqu7pVcvQF2xaJIgtrnc';

  return { CardinalMock, jwt, validationData };
}

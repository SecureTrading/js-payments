import each from 'jest-each';
import { CardinalCommerce, IThreeDQueryResponse } from '../../../src/core/integrations/CardinalCommerce';
import MessageBus from '../../../src/core/shared/MessageBus';
import DomMethods from '../../../src/core/shared/DomMethods';
jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('CardinalCommerce class', () => {
  let instance: any;
  let { jwt, validationData } = CardinalCommerceFixture();
  let Cardinal: any;
  // when
  beforeEach(() => {
    document.body.innerHTML = `<input id='JWTContainer' value="${jwt}" />`;
    instance = new CardinalCommerce(false, false, jwt);
  });

  // given
  describe('CardinalCommerce._3DInitRequest', () => {
    // then
    let sendRequestSpy: any;
    let threedeinitRequest;
    beforeEach(() => {
      sendRequestSpy = jest.spyOn(instance, 'sendRequest');
      threedeinitRequest = instance._3DInitRequest();
    });
  });

  // given
  describe('CardinalCommerce._onCardinalSetupComplete', () => {
    describe('_startOnLoad False', () => {
      // then
      it('should subscribe method be called once', () => {
        const messageBus = new MessageBus();
        const spySubscribe = jest.spyOn(messageBus, 'subscribe');
        const spyPublish = jest.spyOn(messageBus, 'publishFromParent');
        instance.messageBus = messageBus;
        instance._onCardinalSetupComplete();
        expect(spySubscribe).toHaveBeenCalled();
        expect(spyPublish).toHaveBeenCalled();
      });
    });

    describe('_startOnLoad True', () => {
      // then
      it('should subscribe method be called once', () => {
        instance._startOnLoad = true;
        const messageBus = new MessageBus();
        // this JWT contains a 'pan'
        instance._jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTU4NTUxMjA3LjEzNTU5NTMsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJsb2NhbGUiOiJlbl9HQiIsInBhbiI6IjQwMDAwMDAwMDAwMDEwMDAiLCJleHBpcnlkYXRlIjoiMDEvMjIiLCJzZWN1cml0eWNvZGUiOiIxMjMifX0.V_-f5m35ADC4Y9t17mZjaHgNt_0GXMqPhxJWohAYwSA';
        instance._performBinDetection = jest.fn();
        const spyPublish = jest.spyOn(messageBus, 'publishFromParent');
        instance.messageBus = messageBus;
        instance._onCardinalSetupComplete();
        expect(instance._performBinDetection).toHaveBeenCalledWith({ validity: true, value: '4000000000001000' });
        expect(spyPublish).toHaveBeenCalledWith(
          { data: { dataInJwt: true }, type: 'SUBMIT_FORM' },
          'st-control-frame-iframe'
        );
      });
    });
  });

  describe('CardinalCommerce.setNotification', () => {
    // then
    it('should call publishFromParent with SUCCESS', () => {
      instance.messageBus.publishFromParent = jest.fn();
      instance.setNotification('SUCCESS', 'MYCONTENT');
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
        { data: { content: 'MYCONTENT', type: 'SUCCESS' }, type: 'NOTIFICATION' },
        'st-notification-frame-iframe'
      );
    });
    // then
    it('should call publishFromParent with ERROR', () => {
      instance.messageBus.publishFromParent = jest.fn();
      instance.setNotification('ERROR', 'ANOTHER');
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
        { data: { content: 'ANOTHER', type: 'ERROR' }, type: 'NOTIFICATION' },
        'st-notification-frame-iframe'
      );
    });
  });

  describe('CardinalCommerce._performBinDetection', () => {
    // then
    it('should call cardinal bin process', () => {
      let { CardinalMock } = CardinalCommerceFixture();
      // @ts-ignore
      global.Cardinal = CardinalMock;
      instance._performBinDetection({ value: '411111' });
      expect(CardinalMock.trigger).toHaveBeenCalledTimes(1);
      expect(CardinalMock.trigger).toHaveBeenCalledWith('bin.process', { value: '411111' });
    });
  });

  // given
  describe('CardinalCommerce._onCardinalValidated', () => {
    // then
    it('should authorise if successful', () => {
      let spyAuthorize = jest.spyOn(instance, '_authorizePayment');
      instance._onCardinalValidated({ ActionCode: 'SUCCESS' }, 'JWT_VALUE');
      expect(spyAuthorize).toHaveBeenCalled();
      expect(spyAuthorize).toHaveBeenCalledWith({ threedresponse: 'JWT_VALUE' });
    });

    it('should not authorise if not successful', () => {
      let spyAuthorize = jest.spyOn(instance, '_authorizePayment');
      instance._onCardinalValidated({ ActionCode: 'ERROR' }, 'JWT_VALUE');
      expect(spyAuthorize).toHaveBeenCalledTimes(0);
    });
  });

  describe('CardinalCommerce._authenticateCard', () => {
    // then
    it('should call cardinal continue', () => {
      let { CardinalMock, jwt } = CardinalCommerceFixture();
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
      expect(instance._threedQueryTransactionReference).toBe('1-2-3');
    });

    describe('CardinalCommerce._onCardinalLoad', () => {
      // then
      it('should call cardinal methods to setup callbacks and setup process', () => {
        let { CardinalMock, jwt } = CardinalCommerceFixture();
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
        let { CardinalMock } = CardinalCommerceFixture();
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
    describe('CardinalCommerce._threeDSetup()', () => {
      // @ts-ignore
      const onLoad = CardinalCommerce.prototype._onCardinalLoad;

      // then
      it('should call load handler', () => {
        // @ts-ignore
        const spy = jest.spyOn(CardinalCommerce.prototype, '_onCardinalLoad').mockImplementation(() => {});
        instance._threeDSetup();
        const ev = document.createEvent('Event');
        ev.initEvent('load', false, false);
        const script = document.getElementsByTagName('script')[0];
        script.dispatchEvent(ev);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      afterEach(() => {
        // @ts-ignore
        CardinalCommerce.prototype._onCardinalLoad = onLoad;
      });
    });

    describe('CardinalCommerce._initSubscriptions', () => {
      // then
      it('should set up subscribers to control frame setup, threedquery and threedinit events', () => {
        instance.messageBus.subscribeOnParent = jest.fn();
        instance._initSubscriptions();
        expect(instance.messageBus.subscribeOnParent).toHaveBeenCalledTimes(3);
        expect(instance.messageBus.subscribeOnParent.mock.calls[0][0]).toBe('LOAD_CONTROL_FRAME');
        // Annonymous function so can't test using toHaveBeenCalledWith
        expect(instance.messageBus.subscribeOnParent.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(instance.messageBus.subscribeOnParent.mock.calls[0].length).toBe(2);
        expect(instance.messageBus.subscribeOnParent.mock.calls[1][0]).toBe('THREEDINIT');
        // Annonymous function so can't test using toHaveBeenCalledWith
        expect(instance.messageBus.subscribeOnParent.mock.calls[1][1]).toBeInstanceOf(Function);
        expect(instance.messageBus.subscribeOnParent.mock.calls[1].length).toBe(2);
        expect(instance.messageBus.subscribeOnParent.mock.calls[2][0]).toBe('THREEDQUERY');
        // Annonymous function so can't test using toHaveBeenCalledWith
        expect(instance.messageBus.subscribeOnParent.mock.calls[2][1]).toBeInstanceOf(Function);
        expect(instance.messageBus.subscribeOnParent.mock.calls[2].length).toBe(2);
      });

      it('should call _onLoadControlFrame if eventType is LOAD_CONTROL_FRAME', () => {
        instance._onLoadControlFrame = jest.fn();
        instance._onThreeDInitEvent = jest.fn();
        instance._onThreeDQueryEvent = jest.fn();
        instance.messageBus.subscribeOnParent = jest.fn((eventType, callback) => {
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

      it('should call _onThreeDInitEvent if eventType is THREEDINIT', () => {
        instance._onLoadControlFrame = jest.fn();
        instance._onThreeDInitEvent = jest.fn();
        instance._onThreeDQueryEvent = jest.fn();
        instance.messageBus.subscribeOnParent = jest.fn((eventType, callback) => {
          if (eventType === 'THREEDINIT') {
            callback({ myData: 'SOMETHING' });
          }
        });
        instance._initSubscriptions();
        expect(instance._onLoadControlFrame).toHaveBeenCalledTimes(0);
        expect(instance._onThreeDInitEvent).toHaveBeenCalledTimes(1);
        expect(instance._onThreeDInitEvent).toHaveBeenCalledWith({ myData: 'SOMETHING' });
        expect(instance._onThreeDQueryEvent).toHaveBeenCalledTimes(0);
      });

      it('should call _onThreeDQueryEvent if eventType is THREEDQUERY', () => {
        instance._onLoadControlFrame = jest.fn();
        instance._onThreeDInitEvent = jest.fn();
        instance._onThreeDQueryEvent = jest.fn();
        instance.messageBus.subscribeOnParent = jest.fn((eventType, callback) => {
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

    describe('CardinalCommerce._onInit', () => {
      // then
      it('should set up subscribers', () => {
        instance._initSubscriptions = jest.fn();
        instance._onInit();
        expect(instance._initSubscriptions).toHaveBeenCalledTimes(1);
        expect(instance._initSubscriptions).toHaveBeenCalledWith();
      });
    });

    describe('CardinalCommerce._onLoadControlFrame', () => {
      // then
      it('should set up subscribers', () => {
        instance._threeDInitRequest = jest.fn();
        instance._onLoadControlFrame();
        expect(instance._threeDInitRequest).toHaveBeenCalledTimes(1);
        expect(instance._threeDInitRequest).toHaveBeenCalledWith();
      });
    });

    describe('CardinalCommerce._onThreeDInitEvent', () => {
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

    describe('CardinalCommerce._onThreeDQueryEvent', () => {
      // then
      it('should send THREEDQUERY request', () => {
        instance._threeDQueryRequest = jest.fn();
        instance._onThreeDQueryEvent({ 'some data': 'with value' });
        expect(instance._threeDQueryRequest).toHaveBeenCalledTimes(1);
        expect(instance._threeDQueryRequest).toHaveBeenCalledWith({ 'some data': 'with value' });
      });
    });

    describe('CardinalCommerce._threeDInitRequest', () => {
      // then
      it('should publish control iframe event', () => {
        instance.messageBus.publishFromParent = jest.fn();
        instance._threeDInitRequest();
        expect(instance.messageBus.publishFromParent).toHaveBeenCalledTimes(1);
        expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
          { type: 'THREEDINIT' },
          'st-control-frame-iframe'
        );
      });
    });

    describe('CardinalCommerce._threeDSetup', () => {
      // then
      it('should load cardinal javascript', () => {
        const script = document.createElement('script');
        script.setAttribute('src', 'https://example.com');
        script.addEventListener = jest.fn();
        DomMethods.insertScript = jest.fn().mockReturnValueOnce(script);

        instance._threeDSetup();
        expect(DomMethods.insertScript).toHaveBeenCalledTimes(1);
        expect(DomMethods.insertScript).toHaveBeenCalledWith(
          'head',
          'https://songbirdstag.cardinalcommerce.com/cardinalcruise/v1/songbird.js'
        );
        expect(script.addEventListener).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(script.addEventListener.mock.calls[0][0]).toBe('load');
        // Annonymous function so can't test using toHaveBeenCalledWith
        // @ts-ignore
        expect(script.addEventListener.mock.calls[0][1]).toBeInstanceOf(Function);
      });
    });

    describe('CardinalCommerce._threeDQueryRequest', () => {
      // then
      it('should authenticate card if enrolled or frictionless', () => {
        instance._isCardEnrolledAndNotFrictionless = jest.fn().mockReturnValueOnce(true);
        instance._authenticateCard = jest.fn();
        instance._authorizePayment = jest.fn();
        instance._threeDQueryRequest({ transactionreference: '1-2-3' });
        expect(instance._authenticateCard).toHaveBeenCalledTimes(1);
        expect(instance._authorizePayment).toHaveBeenCalledTimes(0);
      });
      it('should authorise payment if NOT (enrolled or frictionless)', () => {
        instance._isCardEnrolledAndNotFrictionless = jest.fn().mockReturnValueOnce(false);
        instance._authenticateCard = jest.fn();
        instance._authorizePayment = jest.fn();
        instance._threeDQueryRequest({ transactionreference: '1-2-3' });
        expect(instance._authenticateCard).toHaveBeenCalledTimes(0);
        expect(instance._authorizePayment).toHaveBeenCalledTimes(1);
      });
    });

    // given
    describe('CardinalCommerce._isCardEnrolledAndNotFrictionless', () => {
      // then
      each([
        ['Y', undefined, false],
        ['Y', 'https://example.com', true],
        ['N', 'https://example.com', false],
        ['N', undefined, false]
      ]).it(
        'should detect if card is enrolled and we did not get a frictionless 3DS 2.0 response',
        async (enrolled, acsurl, expected) => {
          let response: IThreeDQueryResponse = {
            acquirertransactionreference: 'tx-ref',
            acsurl: acsurl,
            enrolled: enrolled,
            threedpayload: 'payload',
            transactionreference: '1-2-3'
          };
          expect(instance._isCardEnrolledAndNotFrictionless(response)).toBe(expected);
        }
      );
    });
  });

  describe('CardinalCommerce._authorizePayment', () => {
    // then
    it('should publish control iframe event with AUTH', () => {
      instance.messageBus.publishFromParent = jest.fn();
      instance._cardinalCommerceCacheToken = 'tokenValue';
      instance._threedQueryTransactionReference = '1-2-3';
      instance._authorizePayment({ some: 'value', cachetoken: 'OVERRIDDEN' });
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
        { type: 'AUTH', data: { some: 'value', cachetoken: 'tokenValue', parenttransactionreference: '1-2-3' } },
        'st-control-frame-iframe'
      );
    });
    // then
    it('should publish control iframe event with AUTH with no data', () => {
      instance.messageBus.publishFromParent = jest.fn();
      instance._cardinalCommerceCacheToken = 'tokenValue';
      instance._threedQueryTransactionReference = '1-2-3';
      instance._authorizePayment();
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
        { type: 'AUTH', data: { cachetoken: 'tokenValue', parenttransactionreference: '1-2-3' } },
        'st-control-frame-iframe'
      );
    });
    // then
    it('should publish control iframe event with CACHETOKENISE', () => {
      instance.messageBus.publishFromParent = jest.fn();
      instance._tokenise = true;
      instance._cardinalCommerceCacheToken = 'tokenValue';
      instance._threedQueryTransactionReference = '1-2-3';
      instance._authorizePayment({ some: 'value', cachetoken: 'OVERRIDDEN' });
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledTimes(1);
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
        {
          type: 'CACHETOKENISE',
          data: { some: 'value', cachetoken: 'tokenValue', parenttransactionreference: '1-2-3' }
        },
        'st-control-frame-iframe'
      );
    });
  });
});

function CardinalCommerceFixture() {
  class CardinalMock {
    static continue = jest.fn();
    static configure = jest.fn();
    static on = jest.fn();
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

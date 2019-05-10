import each from 'jest-each';
import { CardinalCommerce, IThreeDQueryResponse, Cardinal } from '../../../src/core/integrations/CardinalCommerce';
import MessageBus from '../../../src/core/shared/MessageBus';
import { initHighlighting } from 'highlight.js';
import DomMethods from '../../../src/core/shared/DomMethods';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('Class CCIntegration', () => {
  let instance: any;
  let { jwt, validationData } = CardinalCommerceFixture();

  // when
  beforeEach(() => {
    document.body.innerHTML = `<input id='JWTContainer' value="${jwt}" />`;
    instance = new CardinalCommerce();
  });

  // given
  describe('Method _3DInitRequest', () => {
    // then
    let sendRequestSpy: any;
    let threedeinitRequest;
    beforeEach(() => {
      sendRequestSpy = jest.spyOn(instance, 'sendRequest');
      threedeinitRequest = instance._3DInitRequest();
    });
  });

  // given
  describe('Method _onCardinalSetupComplete', () => {
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

  describe('Method _performBinDetection', () => {
    // then
    it('should call cardinal bin process', () => {
      let { CardinalMock } = CardinalCommerceFixture();
      // @ts-ignore
      Cardinal = CardinalMock;
      instance._performBinDetection({ value: '411111' });
      expect(Cardinal.trigger).toHaveBeenCalledTimes(1);
      expect(Cardinal.trigger).toHaveBeenCalledWith('bin.process', '411111');
    });
  });

  // given
  describe('Method _onCardinalValidated', () => {
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

  describe('Method _authenticateCard', () => {
    // then
    it('should call cardinal continue', () => {
      let { CardinalMock, jwt } = CardinalCommerceFixture();
      // @ts-ignore
      Cardinal = CardinalMock;
      instance._cardinalCommerceJWT = jwt;
      instance._authenticateCard({
        acquirertransactionreference: 'cardinal-tx-id',
        acsurl: 'https://example.com',
        enrolled: 'Y',
        threedpayload: 'CARDINAL_ACS_RESPONSE',
        transactionreference: '1-2-3'
      });
      expect(Cardinal.continue).toHaveBeenCalled();
      expect(Cardinal.continue).toHaveBeenCalledWith(
        'cca',
        { AcsUrl: 'https://example.com', Payload: 'CARDINAL_ACS_RESPONSE' },
        { Cart: [], OrderDetails: { TransactionId: 'cardinal-tx-id' } },
        jwt
      );
      expect(instance._threedQueryTransactionReference).toBe('1-2-3');
    });

    describe('Method _onCardinalLoad', () => {
      // then
      it('should call cardinal methods to setup callbacks and setup process', () => {
        let { CardinalMock, jwt } = CardinalCommerceFixture();
        // @ts-ignore
        Cardinal = CardinalMock;
        instance._cardinalCommerceJWT = jwt;
        instance._onCardinalLoad();
        expect(Cardinal.configure).toHaveBeenCalledTimes(1);
        expect(Cardinal.configure).toHaveBeenCalledWith({ logging: { level: 'on' } });
        expect(Cardinal.on).toHaveBeenCalledTimes(2);
        expect(Cardinal.on.mock.calls[0][0]).toBe('payments.setupComplete');
        expect(Cardinal.on.mock.calls[0][1] instanceof Function).toBe(true);

        expect(Cardinal.on.mock.calls[1][0]).toBe('payments.validated');
        expect(Cardinal.on.mock.calls[1][1] instanceof Function).toBe(true);

        expect(Cardinal.setup).toHaveBeenCalledTimes(1);
        expect(Cardinal.setup).toHaveBeenCalledWith('init', { jwt });
      });
    });

    describe('Method _initSubscriptions', () => {
      // then
      it('should set up subscribers to control frame setup, threedquery and threedinit events', () => {
        instance.messageBus.subscribeOnParent = jest.fn();
        instance._initSubscriptions();
        expect(instance.messageBus.subscribeOnParent).toHaveBeenCalledTimes(3);
        expect(instance.messageBus.subscribeOnParent.mock.calls[0][0]).toBe('LOAD_CONTROL_FRAME');
        expect(instance.messageBus.subscribeOnParent.mock.calls[0][1] instanceof Function).toBe(true);
        expect(instance.messageBus.subscribeOnParent.mock.calls[1][0]).toBe('THREEDINIT');
        expect(instance.messageBus.subscribeOnParent.mock.calls[1][1] instanceof Function).toBe(true);
        expect(instance.messageBus.subscribeOnParent.mock.calls[2][0]).toBe('THREEDQUERY');
        expect(instance.messageBus.subscribeOnParent.mock.calls[2][1] instanceof Function).toBe(true);
      });
    });

    describe('Method _onInit', () => {
      // then
      it('should set up subscribers', () => {
        instance._initSubscriptions = jest.fn();
        instance._onInit();
        expect(instance._initSubscriptions).toHaveBeenCalledTimes(1);
        expect(instance._initSubscriptions).toHaveBeenCalledWith();
      });
    });

    describe('Method _onLoadControlFrame', () => {
      // then
      it('should set up subscribers', () => {
        instance._threeDInitRequest = jest.fn();
        instance._onLoadControlFrame();
        expect(instance._threeDInitRequest).toHaveBeenCalledTimes(1);
        expect(instance._threeDInitRequest).toHaveBeenCalledWith();
      });
    });

    describe('Method _onThreeDInitEvent', () => {
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

    describe('Method _onThreeDQueryEvent', () => {
      // then
      it('should send THREEDQUERY request', () => {
        instance._threeDQueryRequest = jest.fn();
        instance._onThreeDQueryEvent({ 'some data': 'with value' });
        expect(instance._threeDQueryRequest).toHaveBeenCalledTimes(1);
        expect(instance._threeDQueryRequest).toHaveBeenCalledWith({ 'some data': 'with value' });
      });
    });

    describe('Method _threeDInitRequest', () => {
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

    describe('Method _threeDSetup', () => {
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
        // @ts-ignore
        expect(script.addEventListener.mock.calls[0][1] instanceof Function).toEqual(true);
      });
    });

    describe('Method _threeDQueryRequest', () => {
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
    describe('Method _isCardEnrolledAndNotFrictionless', () => {
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

  describe('Method _authorizePayment', () => {
    // then
    it('should publish control iframe event', () => {
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI1YzEyODg0NWMxMWI5MjIwZGMwNDZlOGUiLCJpYXQiOjE1NTE4NzM2MDAsImp0aSI6IjQ2LWU';

  return { CardinalMock, jwt, validationData };
}

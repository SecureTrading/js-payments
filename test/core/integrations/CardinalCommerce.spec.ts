import each from 'jest-each';
import { CardinalCommerce, IThreeDQueryResponse, Cardinal } from '../../../src/core/integrations/CardinalCommerce';
import MessageBus from '../../../src/core/shared/MessageBus';

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
});

function CardinalCommerceFixture() {
  class CardinalMock {
    static continue = jest.fn();
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

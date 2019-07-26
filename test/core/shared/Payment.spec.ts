import Payment from '../../../src/core/shared/Payment';
import StTransport from '../../../src/core/classes/StTransport.class';

// given
describe('Payment', () => {
  let { card, wallet, walletverify, instance } = paymentFixture();

  // given
  describe('constructor()', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });

    // then
    it('should set attributes to payment instance', () => {
      // @ts-ignore
      expect(instance._stTransport).toBeInstanceOf(StTransport);
    });
  });

  // given
  describe('byPassInitRequest()', () => {
    const { cachetoken } = paymentFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });
    instance.byPassInitRequest(cachetoken);
    // @ts-ignore
    expect(instance._cardinalCommerceCacheToken).toEqual(cachetoken);
  });

  // given
  describe('processPayment()', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });

    // then
    it('should send AUTH request with card', () => {
      instance.processPayment(['AUTH'], card, {
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['AUTH'],
        merchant: 'data'
      });
    });

    // then
    it('should send CACHETOKENISE request', () => {
      instance.processPayment(['CACHETOKENISE'], card, {});
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['CACHETOKENISE']
      });
    });

    // then
    it('should send AUTH request with card and additional data', () => {
      instance.processPayment(
        ['AUTH'],
        card,
        { pan: 'overridden', merchant: 'data' },
        {
          securitycode: 'overridden',
          additional: 'some data'
        }
      );
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['AUTH'],
        merchant: 'data',
        additional: 'some data'
      });
    });

    // then
    it('should send AUTH request with wallet', () => {
      instance.processPayment(['AUTH'], wallet, {
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        requesttypedescriptions: ['AUTH'],
        merchant: 'data'
      });
    });

    // then
    it('should send AUTH request with wallet and additional data', () => {
      instance.processPayment(
        ['AUTH'],
        wallet,
        {
          wallettoken: 'overridden',
          merchant: 'data'
        },
        {
          walletsource: 'OVERRIDDEN',
          extra: 'some value'
        }
      );
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        requesttypedescriptions: ['AUTH'],
        merchant: 'data',
        extra: 'some value'
      });
    });

    // then
    it('should send CACHETOKENISE request with wallet and additional data', () => {
      instance.processPayment(
        ['CACHETOKENISE'],
        wallet,
        {
          wallettoken: 'overridden',
          merchant: 'data'
        },
        {
          walletsource: 'OVERRIDDEN',
          extra: 'some value'
        }
      );
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        requesttypedescriptions: ['CACHETOKENISE'],
        merchant: 'data',
        extra: 'some value'
      });
    });

    // then
    it('should return response', () => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          response: {}
        })
      );
      // @ts-ignore;
      instance.processPayment().then(result => {
        expect(result).toStrictEqual({
          response: {}
        });
      });
    });
  });

  // given
  describe('threeDInitRequest()', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
    });

    // then
    it('should send JSINIT request', () => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          cachetoken: 'content'
        })
      );
      instance.threeDInitRequest();
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        requesttypedescriptions: ['JSINIT']
      });
    });

    // then
    it('should return result', () => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          jwt: 'somejwt',
          response: {}
        })
      );
      // @ts-ignore;
      instance.threeDInitRequest().then(result => {
        expect(result).toStrictEqual({
          jwt: 'somejwt',
          response: {}
        });
      });
    });
  });

  // given
  describe('threeDQueryRequest()', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });

    // then
    it('should send THREEDQUERY request', () => {
      // @ts-ignore
      instance._cardinalCommerceCacheToken = 'cardinalcachetoken';
      instance.threeDQueryRequest(['THREEDQUERY'], card, {
        pan: 'overridden',
        merchant: 'data'
      });

      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['THREEDQUERY'],
        merchant: 'data',
        termurl: 'https://termurl.com',
        cachetoken: 'cardinalcachetoken'
      });
    });
  });

  // given
  describe('walletVerify()', () => {
    // then
    it('should send WALLETVERIFY request with walletverify', () => {
      instance.walletVerify(walletverify);
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        requesttypedescriptions: ['WALLETVERIFY'],
        walletsource: 'APPLEPAY',
        walletmerchantid: '123456789',
        walletvalidationurl: 'https://example.com',
        walletrequestdomain: 'https://example2.com'
      });
    });
  });
});

function paymentFixture() {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTAwMCIsImN1cnJlbmN5aXNvM2EiOiJHQlAifSwiaWF0IjoxNTE2MjM5MDIyfQ.jPuLMHxK3fznVddzkRoYC94hgheBXI1Y7zHAr7qNCig';
  let instance: Payment;
  const cachetoken = 'somecachetoken';
  instance = new Payment(jwt, 'https://example.com');
  const card = {
    expirydate: '10/22',
    pan: '4111111111111111',
    securitycode: '123'
  };
  const wallet = {
    walletsource: 'APPLEPAY',
    wallettoken: 'encryptedpaymentdata'
  };
  const walletverify = {
    walletsource: 'APPLEPAY',
    walletmerchantid: '123456789',
    walletvalidationurl: 'https://example.com',
    walletrequestdomain: 'https://example2.com'
  };
  return { card, wallet, walletverify, instance, jwt, cachetoken };
}

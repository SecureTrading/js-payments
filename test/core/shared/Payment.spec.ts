import Payment from '../../../src/core/shared/Payment';
import StTransport from '../../../src/core/classes/StTransport.class';

// given
describe('Payment class', () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTAwMCIsImN1cnJlbmN5aXNvM2EiOiJHQlAifSwiaWF0IjoxNTE2MjM5MDIyfQ.jPuLMHxK3fznVddzkRoYC94hgheBXI1Y7zHAr7qNCig';
  let instance: Payment;
  let { card, wallet, walletverify } = paymentFixture();
  // when
  beforeAll(() => {
    instance = new Payment(jwt, 'https://example.com');
    // @ts-ignore
    instance._stTransport.sendRequest = jest.fn();
  });

  // given
  describe('Payment.constructor', () => {
    // then
    it('should set attributes to payment instance', () => {
      // @ts-ignore
      expect(instance._stTransport).toBeInstanceOf(StTransport);
    });
  });

  // given
  describe('Payment.walletVerify', () => {
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

  // given
  describe('Payment.processPayment', () => {
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
    }); // then
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
  });
  // given
  describe('Payment.threeDInitRequest', () => {
    // then
    it('should send JSINIT request', () => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValue(
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
  });
  // given
  describe('Payment.threeDQueryRequest', () => {
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
});

function paymentFixture() {
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
  return { card, wallet, walletverify };
}

import Payment from '../../../src/core/shared/Payment';
import StTransport from '../../../src/core/classes/StTransport.class';
import { StJwt } from '../../../src/core/shared/StJwt';

describe('Payment', () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTAwMCIsImN1cnJlbmN5aXNvM2EiOiJHQlAifSwiaWF0IjoxNTE2MjM5MDIyfQ.jPuLMHxK3fznVddzkRoYC94hgheBXI1Y7zHAr7qNCig';
  let instance: Payment;
  let { card, wallet, walletverify } = paymentFixture();

  beforeAll(() => {
    instance = new Payment(jwt);
    // @ts-ignore
    instance._stTransport.sendRequest = jest.fn();
  });

  describe('constructor', () => {
    it('should set attributes to payment instance', () => {
      // @ts-ignore
      expect(instance._stTransport).toBeInstanceOf(StTransport);
      // @ts-ignore
      expect(instance._stJwtDecode).toBeInstanceOf(StJwt);
      // @ts-ignore
      expect(instance._stJwtPayload).toMatchObject({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        sitereference: 'example12345'
      });
    });
  });

  describe('tokenizeCard', () => {
    it('should send CACHETOKENISE request', () => {
      instance.tokenizeCard(card);
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        expirydate: '10/22',
        pan: '4111111111111111',
        requesttypedescription: 'CACHETOKENISE',
        securitycode: '123',
        sitereference: 'example12345'
      });
    });
  });

  describe('walletVerify', () => {
    it('should send WALLETVERIFY request with walletverify', () => {
      instance.walletVerify(walletverify);
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        requesttypedescription: 'WALLETVERIFY',
        walletsource: 'APPLEPAY',
        walletmerchantid: '123456789',
        walletvalidationurl: 'https://example.com',
        walletrequestdomain: 'https://example2.com',
        sitereference: 'example12345'
      });
    });
  });

  describe('authorizePayment', () => {
    it('should send AUTH request with card', () => {
      instance.authorizePayment(card, { merchant: 'data' });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        expirydate: '10/22',
        pan: '4111111111111111',
        requesttypedescription: 'AUTH',
        securitycode: '123',
        sitereference: 'example12345',
        merchant: 'data'
      });
    });

    it('should send AUTH request with card and additional data', () => {
      instance.authorizePayment(
        card,
        { pan: 'overridden', merchant: 'data' },
        { securitycode: 'overridden', additional: 'some data' }
      );
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        expirydate: '10/22',
        pan: '4111111111111111',
        requesttypedescription: 'AUTH',
        securitycode: '123',
        sitereference: 'example12345',
        merchant: 'data',
        additional: 'some data'
      });
    });

    it('should send AUTH request with wallet', () => {
      instance.authorizePayment(wallet, { merchant: 'data' });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        requesttypedescription: 'AUTH',
        sitereference: 'example12345',
        merchant: 'data'
      });
    });

    it('should send AUTH request with wallet and additional data', () => {
      instance.authorizePayment(
        wallet,
        { wallettoken: 'overridden', merchant: 'data' },
        { walletsource: 'OVERRIDDEN', extra: 'some value' }
      );
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        requesttypedescription: 'AUTH',
        sitereference: 'example12345',
        merchant: 'data',
        extra: 'some value'
      });
    });
  });

  describe('threeDInitRequest', () => {
    it('should send JSINIT request', () => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValue(Promise.resolve({ cachetoken: 'content' }));
      instance.threeDInitRequest();
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        baseamount: '1000',
        currencyiso3a: 'GBP',
        requesttypedescription: 'JSINIT',
        sitereference: 'example12345'
      });
    });
  });

  describe('threeDQueryRequest', () => {
    it('should send THREEDQUERY request', () => {
      // @ts-ignore
      instance._cardinalCommerceCacheToken = 'cardinalcachetoken';
      instance.threeDQueryRequest(card, { pan: 'overridden', merchant: 'data' });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        expirydate: '10/22',
        pan: '4111111111111111',
        requesttypedescription: 'THREEDQUERY',
        securitycode: '123',
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

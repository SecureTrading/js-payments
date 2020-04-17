import { Payment } from './Payment';
import { StTransport } from '../services/StTransport.class';
import { StJwt } from './StJwt';
import { Container } from 'typedi';
import { Cybertonica } from '../integrations/Cybertonica';
import { mock, instance as mockInstance, when } from 'ts-mockito';

jest.mock('../../../../src/application/core/shared/Notification');

const cybertonicaTid = 'b268ab7f-25d7-430a-9be2-82b0f00c4039';

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
  describe('bypassInitRequest()', () => {
    const { cachetoken } = paymentFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn();
    });
    instance.setCardinalCommerceCacheToken(cachetoken);
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
    it('should send AUTH request with card', async () => {
      await instance.processPayment(['AUTH'], card, {
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['AUTH'],
        merchant: 'data',
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    // then
    it('should send CACHETOKENISE request', async () => {
      await instance.processPayment(['CACHETOKENISE'], card, {});
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['CACHETOKENISE'],
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    // then
    it('should send AUTH request with card and additional data', async () => {
      await instance.processPayment(
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
        additional: 'some data',
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    // then
    it('should send AUTH request with wallet', async () => {
      await instance.processPayment(['AUTH'], wallet, {
        merchant: 'data'
      });
      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        walletsource: 'APPLEPAY',
        wallettoken: 'encryptedpaymentdata',
        requesttypedescriptions: ['AUTH'],
        merchant: 'data',
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    // then
    it('should send AUTH request with wallet and additional data', async () => {
      await instance.processPayment(
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
        extra: 'some value',
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    // then
    it('should send CACHETOKENISE request with wallet and additional data', async () => {
      await instance.processPayment(
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
        extra: 'some value',
        fraudcontroltransactionid: cybertonicaTid
      });
    });

    // then
    it('should return response', async () => {
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          response: {}
        })
      );
      // @ts-ignore;
      await instance.processPayment().then(result => {
        expect(result).toStrictEqual({
          response: {}
        });
      });
    });
  });

  // given
  describe('threeDInitRequest()', () => {
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

    // then
    it('should create object StJwt to decode jwt', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjUxNzYwODksInBheWxvYWQiOnsicmVxdWVzdHJlZmVyZW5jZSI6Ilc0Mi0zZjV4NjkzeCIsInZlcnNpb24iOiIxLjAwIiwiand0IjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKc2FYWmxNbDloZFhSdmFuZDBJaXdpYVdGMElqb3hOVFkxTVRjMk1EZzVMQ0p3WVhsc2IyRmtJanA3SW14dlkyRnNaU0k2SW1WdVgwZENJaXdpWW1GelpXRnRiM1Z1ZENJNklqRXdNREFpTENKamRYSnlaVzVqZVdsemJ6TmhJam9pUjBKUUlpd2ljMmwwWlhKbFptVnlaVzVqWlNJNkluUmxjM1F4SWl3aVlXTmpiM1Z1ZEhSNWNHVmtaWE5qY21sd2RHbHZiaUk2SWtWRFQwMGlmWDAuQVNheUtCTWxIWU16UXZjdEZvb1BGbmZSVmVBM2dsZ3h3UTlPeEtqSXhGMCIsInJlc3BvbnNlIjpbeyJ0cmFuc2FjdGlvbnN0YXJ0ZWR0aW1lc3RhbXAiOiIyMDE5LTA4LTA3IDExOjA4OjA5IiwiZXJyb3JtZXNzYWdlIjoiT2siLCJjYWNoZXRva2VuIjoiZXlKa1lYUmhZMlZ1ZEdWeWRYSnNJam9nYm5Wc2JDd2dJbU5oWTJobGRHOXJaVzRpT2lBaU5ESXROMlptTm1JMU5HWmhZalpoTjJKbU5qQmpNamcwTWpaaVpqQTRNak01Tnpka056bGlOalJqWmpVMU0yUTVaVGxoTXpGa016Wm1aVEkxWm1Rd05UZ3dNQ0o5IiwiZXJyb3Jjb2RlIjoiMCIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb24iOiJKU0lOSVQiLCJ0aHJlZWRpbml0IjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SlNaV1psY21WdVkyVkpaQ0k2SWpReUxUZG1aalppTlRSbVlXSTJZVGRpWmpZd1l6STROREkyWW1Zd09ESXpPVGMzWkRjNVlqWTBZMlkxTlROa09XVTVZVE14WkRNMlptVXlOV1prTURVNE1EQWlMQ0pwYzNNaU9pSTFZekV5T0RnME5XTXhNV0k1TWpJd1pHTXdORFpsT0dVaUxDSnFkR2tpT2lJME1pMDNabVkyWWpVMFptRmlObUUzWW1ZMk1HTXlPRFF5Tm1KbU1EZ3lNemszTjJRM09XSTJOR05tTlRVelpEbGxPV0V6TVdRek5tWmxNalZtWkRBMU9EQXdJaXdpYVdGMElqb3hOVFkxTVRjMk1EZzVMQ0pRWVhsc2IyRmtJanA3SWs5eVpHVnlSR1YwWVdsc2N5STZleUpCYlc5MWJuUWlPakV3TURBc0lrTjFjbkpsYm1ONVEyOWtaU0k2SWpneU5pSjlmU3dpVDNKblZXNXBkRWxrSWpvaU5XTXhNVE5sT0dVMlptVXpaREV5TkRZd01UUXhPRFk0SW4wLjV0d0pCTHVSYWg4QXpxcVptQktPVy1XaEJpOGd4SWxBV1c4NS03cE5DZWMiLCJjdXN0b21lcm91dHB1dCI6IlJFU1VMVCJ9XSwic2VjcmFuZCI6Ikl1b3U1UFU5OXFCeWtDMnAifSwiYXVkIjoibGl2ZTJfYXV0b2p3dCJ9.tjxxI1RR7C9bG6F0VAYPvSrZoRqy7pYrQmsT1fBd3rI';
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          jwt,
          response: {}
        })
      );
      const testJWT = new StJwt(jwt);
      // @ts-ignore
      instance.threeDInitRequest().then(result => {
        // @ts-ignore;
        expect(instance._cardinalCommerceCacheToken).toEqual(testJWT.payload.response[0].cachetoken);
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
    it('should send THREEDQUERY request', async () => {
      // @ts-ignore
      instance._cardinalCommerceCacheToken = 'cardinalcachetoken';
      await instance.threeDQueryRequest(['THREEDQUERY'], card, {
        pan: 'overridden',
        merchant: 'data'
      });

      // @ts-ignore
      expect(instance._stTransport.sendRequest).toHaveBeenCalledWith({
        ...card,
        requesttypedescriptions: ['THREEDQUERY'],
        merchant: 'data',
        termurl: 'https://termurl.com',
        cachetoken: 'cardinalcachetoken',
        fraudcontroltransactionid: cybertonicaTid
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
  const cybertonicaMock = mock(Cybertonica);
  when(cybertonicaMock.getTransactionId()).thenResolve(cybertonicaTid);
  Container.set(Cybertonica, mockInstance(cybertonicaMock));
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

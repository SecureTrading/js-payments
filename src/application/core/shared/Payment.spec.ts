import { Payment } from './Payment';
import { StTransport } from '../services/StTransport.class';
import { Container } from 'typedi';
import { Cybertonica } from '../integrations/Cybertonica';
import { mock, instance as mockInstance, when } from 'ts-mockito';
import { ICard } from '../models/ICard';
import { ConfigProvider } from '../../../shared/services/config/ConfigProvider';
import { TestConfigProvider } from '../../../testing/mocks/TestConfigProvider';
import { StoreBasedStorage } from '../../../shared/services/storage/StoreBasedStorage';
import { SimpleStorage } from '../../../shared/services/storage/SimpleStorage';

Container.set({ id: ConfigProvider, type: TestConfigProvider });

jest.mock('../../../../src/application/core/shared/notification/Notification');

const cybertonicaTid = 'b268ab7f-25d7-430a-9be2-82b0f00c4039';

Container.set({ id: StoreBasedStorage, type: SimpleStorage });

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
      instance._stTransport._threeDQueryResult = { response: { errormessage: 'Ok' }, jwt: 'jwt' };
      // @ts-ignore
      instance._stTransport.sendRequest = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          response: {}
        })
      );
      // @ts-ignore;
      await instance.processPayment([], {} as ICard, {}, {}).then(result => {
        expect(result).toStrictEqual({
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
  instance = new Payment();
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

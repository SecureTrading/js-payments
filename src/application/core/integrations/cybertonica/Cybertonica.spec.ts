import { mock } from 'ts-mockito';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { Cybertonica } from './Cybertonica';

// given
describe('Cybertonica', () => {
  const { instance } = cybertonicaFixture();

  // given
  describe('_onInit', () => {
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._insertCybertonicaLibrary = jest.fn();
      // @ts-ignore
      instance._insertCybertonicaLibrary = jest.fn().mockResolvedValueOnce('TID VALUE');
    });

    // then
    it('should call _insertCybertonicaLibrary', async () => {
      // @ts-ignore
      instance.init();
      // @ts-ignore
      expect(instance._insertCybertonicaLibrary).toHaveBeenCalled();
    });
  });

  // given
  describe('getBasename', () => {
    // then
    it('should calculate base name', async () => {
      // @ts-ignore
      const data = await Cybertonica.getBasename();
      // @ts-ignore
      expect(data).toEqual('https://cyber.securetrading.net');
    });
  });
});

function cybertonicaFixture() {
  const localStorage: BrowserLocalStorage = mock(BrowserLocalStorage);
  localStorage.getItem = jest.fn().mockReturnValueOnce('en');
  const instance = new Cybertonica(localStorage);
  return { instance };
}

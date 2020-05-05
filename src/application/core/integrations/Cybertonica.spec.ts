import { mock } from 'ts-mockito';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Cybertonica } from './Cybertonica';

// given
describe('Cybertonica', () => {
  const { instance } = cybertonicaFixture();

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
  const instance = new Cybertonica(localStorage);
  return { instance };
}

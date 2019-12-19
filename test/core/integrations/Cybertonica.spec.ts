import { Cybertonica } from '../../../src/core/integrations/Cybertonica';
import { environment } from '../../../src/environments/environment';

// given
describe('Cybertonica', () => {
  // when
  CybertonicaFixture();
  // then
  it('should load Cybertonica sdk', () => {
    const scripts = Array.from(document.getElementsByTagName('script'));
    expect(scripts.some(script => script.getAttribute('src') === environment.CYBERTONICA.CYBERTONICA_LIVE_URL)).toEqual(
      true
    );
  });
});

function CybertonicaFixture() {
  const instance: Cybertonica = new Cybertonica();
  return { instance };
}

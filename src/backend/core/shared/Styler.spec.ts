import { Styler } from './Styler';

describe('Styler', () => {
  let styler: Styler;

  beforeAll(() => {
    styler = new Styler({
      style1: { property: 'font-size', selector: '.test' },
      style2: { property: 'color', selector: '#identifier' },
      style3: { property: 'color', selector: '.test' }
    });
  });

  beforeEach(() => {
    document.head.innerHTML = '';
  });

  describe('inject()', () => {
    it('should inject body display', () => {
      let styles = {};
      styler.inject(styles);
      let actual = document.head.getElementsByTagName('style')[0].innerHTML;
      let expected = 'body { display: block; }';
      expect(actual).toBe(expected);
    });

    it('should inject single style', () => {
      let styles = { style1: '12px' };
      styler.inject(styles);
      let actual = document.head.getElementsByTagName('style')[0].innerHTML;
      let expected = 'body { display: block; } .test { font-size: 12px; }';
      expect(actual).toBe(expected);
    });

    it('should inject multiple styles', () => {
      let styles = { style1: '12px', style2: 'blue', style3: 'green' };
      styler.inject(styles);
      let actual = document.head.getElementsByTagName('style')[0].innerHTML;
      let expected = 'body { display: block; } .test { font-size: 12px; color: green; } #identifier { color: blue; }';
      expect(actual).toBe(expected);
    });

    it('should ignore invalid styles', () => {
      let styles = { style4: '12px' };
      styler.inject(styles);
      let actual = document.head.getElementsByTagName('style')[0].innerHTML;
      let expected = 'body { display: block; }';
      expect(actual).toBe(expected);
    });
  });
});

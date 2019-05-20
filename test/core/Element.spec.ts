import { environment } from '../../src/environments/environment';
import Element from '../../src/core/Element';
import Selectors from '../../src/core/shared/Selectors';

// given
describe('Element class', () => {
  //when
  let instance: Element,
    mockObject: object,
    createNewElement: object,
    createNewStyledElement: object,
    createNewStyledAndParamedElement: object;

  beforeEach(() => {
    mockObject = {
      _name: ''
    };
    createNewElement = {
      _name: 'cardNumber',
      _iframeSrc: `${environment.FRAME_URL}/card-number.html?`
    };
    createNewStyledElement = {
      _name: 'cardNumber',
      _iframeSrc: `${
        environment.FRAME_URL
      }/card-number.html?background-color-input=AliceBlue&color-input-error=%23721c24`
    };
    createNewStyledAndParamedElement = {
      _name: 'cardNumber',
      _iframeSrc: `${
        environment.FRAME_URL
      }/card-number.html?background-color-input=AliceBlue&color-input-error=%23721c24&locale=en_GB`
    };
    instance = new Element();
  });
  // given
  describe('Element.constructor', () => {
    //then
    it('should have initial settings ', () => {
      expect(instance).toMatchObject(mockObject);
    });

    // then
    it('should return proper iframe endpoints', () => {
      expect(Element.getComponentAddress('cardNumber')).toEqual(Selectors.CARD_NUMBER_COMPONENT);
      expect(Element.getComponentAddress('securityCode')).toEqual(Selectors.SECURITY_CODE_COMPONENT);
      expect(Element.getComponentAddress('expirationDate')).toEqual(Selectors.EXPIRATION_DATE_COMPONENT);
      expect(Element.getComponentAddress('notificationFrame')).toEqual(Selectors.NOTIFICATION_FRAME_COMPONENT);
      expect(Element.getComponentAddress('controlFrame')).toEqual(Selectors.CONTROL_FRAME_COMPONENT);
      expect(Element.getComponentAddress('animatedCard')).toEqual(Selectors.ANIMATED_CARD_COMPONENT);
    });

    // then
    it('should create new element', () => {
      instance.create('cardNumber', {});
      expect(instance).toMatchObject(createNewElement);
    });

    // then
    it('should create new element with styles', () => {
      instance.create('cardNumber', {
        'background-color-input': 'AliceBlue',
        'color-input-error': '#721c24'
      });
      expect(instance).toMatchObject(createNewStyledElement);
    });

    // then
    it('should create new element with styles and params', () => {
      instance.create(
        'cardNumber',
        {
          'background-color-input': 'AliceBlue',
          'color-input-error': '#721c24'
        },
        { locale: 'en_GB' }
      );
      expect(instance).toMatchObject(createNewStyledAndParamedElement);
    });
  });

  // given
  describe('Element.createFormElement', () => {
    // then
    it('should create new DOM element', () => {
      // @ts-ignore
      const actual = Element.createFormElement('input', 'myID');
      expect(actual.tagName).toBe('INPUT');
      expect(actual.id).toBe('myID');
      expect(actual.className).toBe('myID');
    });
  });

  // given
  describe('Element.mount', () => {
    // then
    it('should create iframe element', () => {
      instance.iframeSrc = 'https://example.com';
      const actual = instance.mount('myID');
      expect(actual.tagName).toBe('IFRAME');
      expect(actual.id).toBe('myID');
      expect(actual.className).toBe('myID');
      expect(actual.getAttribute('src')).toBe('https://example.com');
      expect(actual.getAttribute('name')).toBe('myID');
    });
  });

  // given
  describe('Element.name', () => {
    // then
    it('should use set and get', () => {
      instance.name = 'Some name';
      expect(instance.name).toBe('Some name');
    });
  });
});

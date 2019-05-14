import { environment } from '../../src/environments/environment';
import Element from '../../src/core/Element';
import Selectors from '../../src/core/shared/Selectors';

// given
describe('Index placeholder test', () => {
  //when
  let element,
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
  });

  describe('constructor', () => {
    //then
    it('should have initial settings ', () => {
      element = new Element();
      expect(element).toMatchObject(mockObject);
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
      element = new Element();
      element.create('cardNumber', {});
      expect(element).toMatchObject(createNewElement);
    });

    // then
    it('should create new element with styles', () => {
      element = new Element();
      element.create('cardNumber', {
        'background-color-input': 'AliceBlue',
        'color-input-error': '#721c24'
      });
      expect(element).toMatchObject(createNewStyledElement);
    });

    // then
    it('should create new element with styles and params', () => {
      element = new Element();
      element.create(
        'cardNumber',
        {
          'background-color-input': 'AliceBlue',
          'color-input-error': '#721c24'
        },
        { locale: 'en_GB' }
      );
      expect(element).toMatchObject(createNewStyledAndParamedElement);
    });
  });

  describe('createFormElement', () => {
    // then
    it('should create new DOM element', () => {
      // @ts-ignore
      const actual = Element.createFormElement('input', 'myID');
      expect(actual.tagName).toBe('INPUT');
      expect(actual.id).toBe('myID');
      expect(actual.className).toBe('myID');
    });
  });

  describe('mount', () => {
    // then
    it('should create iframe element', () => {
      let element = new Element();
      element.iframeSrc = 'https://example.com';
      let actual = element.mount('myID');
      expect(actual.tagName).toBe('IFRAME');
      expect(actual.id).toBe('myID');
      expect(actual.className).toBe('myID');
      expect(actual.getAttribute('src')).toBe('https://example.com');
      expect(actual.getAttribute('name')).toBe('myID');
    });
  });

  describe('name', () => {
    // then
    it('should use set and get', () => {
      let element = new Element();
      element.name = 'Some name';
      expect(element.name).toBe('Some name');
    });
  });
});

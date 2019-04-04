import Element from '../../src/core/Element';
import Selectors from '../../src/core/shared/Selectors';
// given
describe('Index placeholder test', () => {
  //when
  let element, mockObject: object, createNewElement: object, createNewStyledElement: object;

  beforeEach(() => {
    mockObject = {
      _name: ''
    };
    createNewElement = {
      _name: 'cardNumber',
      _iframeSrc: '/card-number.html?'
    };
    createNewStyledElement = {
      _name: 'cardNumber',
      _iframeSrc: '/card-number.html?background-color-input=AliceBlue&color-input-error=%23721c24'
    };
  });

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
    element.create('cardNumber', { 'background-color-input': 'AliceBlue', 'color-input-error': '#721c24' });
    expect(element).toMatchObject(createNewStyledElement);
  });
});

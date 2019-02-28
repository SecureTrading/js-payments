import Element from '../src/core/classes/Element.class';
import ST from '../src/core/classes/ST.class';
// given
describe('Index placeholder test', () => {
  //when
  let element, mockObject: object, createNewElement: object;

  beforeEach(() => {
    mockObject = {
      _name: ''
    };
    createNewElement = {
      _name: 'newTestObjectName'
    };
  });

  //then
  it('should have initial settings ', () => {
    element = new Element();
    expect(element).toMatchObject(mockObject);
  });

  // then
  it('should return proper iframe endpoints', () => {
    expect(Element.getComponentAddress('cardNumber')).toEqual(
      ST.cardNumberComponent
    );
    expect(Element.getComponentAddress('securityCode')).toEqual(
      ST.securityCodeComponent
    );
    expect(Element.getComponentAddress('expirationDate')).toEqual(
      ST.expirationDateComponent
    );
  });

  // then
  it('should create new element', () => {
    element = new Element();
    element.create('newTestObjectName');
    expect(element).toMatchObject(createNewElement);
  });
});

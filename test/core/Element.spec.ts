import Element from '../../src/core/Element';
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
    expect(Element.getComponentAddress('cardNumber')).toEqual(Element.CARD_NUMBER_COMPONENT);
    expect(Element.getComponentAddress('securityCode')).toEqual(Element.SECURITY_CODE_COMPONENT);
    expect(Element.getComponentAddress('expirationDate')).toEqual(Element.EXPIRATION_DATE_COMPONENT);
  });

  // then
  it('should create new element', () => {
    element = new Element();
    element.create('newTestObjectName');
    expect(element).toMatchObject(createNewElement);
  });
});

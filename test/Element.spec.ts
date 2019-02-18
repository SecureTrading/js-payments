import { Element, RegisterElements } from '../src/core/classes/Element.class';
// given
describe('Index placeholder test', () => {
  //when
  let element, mockObject: object;
  beforeEach(() => {
    mockObject = {
      _name: '',
      _style: {
        color: '#fff',
        fontWeight: '600',
        fontFamily: 'Lato, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
      },
    };
  });

  //then
  it('should have initial settings ', () => {
    element = new Element();
    expect(element).toMatchObject(mockObject);
  });

  // then
  it('should return proper iframe endpoints', () => {
    expect(Element.getComponentAdress('cardNumber')).toEqual(
      'http://localhost:8081'
    );
    expect(Element.getComponentAdress('securityCode')).toEqual(
      'http://localhost:8082'
    );
    expect(Element.getComponentAdress('expirationDate')).toEqual(
      'http://localhost:8083'
    );
  });
  it('should create new element', () => {
    const mockObject = {
      _name: 'newTestObjectName',
      _style: {
        color: '#eee',
        fontWeight: '100',
      },
    };
    element = new Element();
    element.create('newTestObjectName', {
      color: '#eee',
      fontWeight: '100',
    });
    expect(element).toMatchObject(mockObject);
  });
});

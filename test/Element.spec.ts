import { Element } from '../src/core/classes/Element.class';
import { iframesEndpoints } from '../src/core/imports/iframe';
// given
describe('Index placeholder test', () => {
  //when
  let element, mockObject: object, createNewElement: object;
  const { cardNumber, expirationDate, securityCode } = iframesEndpoints;

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
    createNewElement = {
      _name: 'newTestObjectName',
      _style: {
        color: '#eee',
        fontWeight: '100',
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
    expect(Element.getComponentAdress('cardNumber')).toEqual(cardNumber);
    expect(Element.getComponentAdress('securityCode')).toEqual(expirationDate);
    expect(Element.getComponentAdress('expirationDate')).toEqual(securityCode);
  });

  // then
  it('should create new element', () => {
    element = new Element();
    element.create('newTestObjectName', {
      color: '#eee',
      fontWeight: '100',
    });
    expect(element).toMatchObject(createNewElement);
  });
});

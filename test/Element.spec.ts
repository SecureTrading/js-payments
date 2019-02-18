import { Element, RegisterElements } from '../src/core/classes/Element.class';
// given
describe('Index placeholder test', () => {
  //when
  let element;
  beforeEach(() => {});

  //then
  it('should have initial settings ', () => {
    element = new Element();
    expect(element._name).toEqual('');
  });
});

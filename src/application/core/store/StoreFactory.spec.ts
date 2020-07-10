import { StoreFactory } from './StoreFactory';
import any = jasmine.any;

describe('StoreFactory', () => {
  it('creates redux store', () => {
    const storeFactory = new StoreFactory();
    const store = storeFactory.createStore();

    expect(store).toEqual({
      dispatch: any(Function),
      getState: any(Function),
      replaceReducer: any(Function),
      subscribe: any(Function),
      [Symbol.observable]: any(Function)
    });
  });
});

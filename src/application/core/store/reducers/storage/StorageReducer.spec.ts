import { storageReducer } from './StorageReducer';
import { IStorageState } from './IStorageState';
import { IAction } from '../../IAction';

describe('StorageReducer', () => {
  let initialState: IStorageState;

  beforeEach(() => {
    initialState = {} as IStorageState;
  });

  it('handles SET_ITEM action', () => {
    const action: IAction = { type: 'STORAGE/SET_ITEM', payload: { key: 'foo', value: 123 } };
    const result = storageReducer(initialState, action);

    expect(result).toEqual({ foo: 123 });
  });
});

import { IConfig } from '../../../../../shared/model/config/IConfig';
import { UPDATE_CONFIG } from './StorageActions';
import { storageReducer } from './StorageReducer';
import { IStorageState } from './IStorageState';

describe('ConfigReducer', () => {
  let initialState: IStorageState;

  beforeEach(() => {
    initialState = {} as IStorageState;
  });

  it('handles UPDATE_CONFIG action', () => {
    const config = ({ FOO: 'BAR' } as unknown) as IConfig;
    const result = storageReducer(initialState, { type: UPDATE_CONFIG, payload: config });

    expect(result).toEqual({ config });
  });
});

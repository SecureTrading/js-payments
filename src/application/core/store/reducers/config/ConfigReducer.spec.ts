import { IConfig } from '../../../../../shared/model/config/IConfig';
import { UPDATE_CONFIG } from './ConfigActions';
import { configReducer } from './ConfigReducer';
import { IConfigState } from './IConfigState';

describe('ConfigReducer', () => {
  let initialState: IConfigState;

  beforeEach(() => {
    initialState = {} as IConfigState;
  });

  it('handles UPDATE_CONFIG action', () => {
    const config = ({ FOO: 'BAR' } as unknown) as IConfig;
    const result = configReducer(initialState, { type: UPDATE_CONFIG, payload: config });

    expect(result).toEqual({ config });
  });
});

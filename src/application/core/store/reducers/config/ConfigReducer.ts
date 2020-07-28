import { IConfigState, INITIAL_STATE } from './IConfigState';
import { CLEAR_CONFIG, UPDATE_CONFIG } from './ConfigActions';
import { createReducer, on } from '../../createReducer';

export const configReducer = createReducer<IConfigState>(
  INITIAL_STATE,
  on(UPDATE_CONFIG, (state, action) => ({ ...state, config: action.payload })),
  on(CLEAR_CONFIG, state => ({ ...state, config: null }))
);

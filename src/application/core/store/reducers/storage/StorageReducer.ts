import { INITIAL_STATE, IStorageState } from './IStorageState';
import { SET_ITEM } from './IStorageActionsMap';
import { createReducer, on } from '../../createReducer';

export const storageReducer = createReducer<IStorageState>(
  INITIAL_STATE,
  on(SET_ITEM, (state, action) => ({ ...state, [action.payload.key]: action.payload.value }))
);

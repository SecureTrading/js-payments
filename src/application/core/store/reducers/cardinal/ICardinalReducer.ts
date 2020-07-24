import { createReducer, on } from '../../createReducer';
import { ICardinalState, INITIAL_STATE } from './ICardinalState';
import { JSINIT_COMPLETED, JSINIT_FAILED, JSINIT_STARTED } from './ICardinalActionsMap';
import { UPDATE_CONFIG } from '../config/IConfigActionsMap';

export const cardinalReducer = createReducer<ICardinalState>(
  INITIAL_STATE,
  on(JSINIT_STARTED, state => ({ ...state, jsinitPending: true })),
  on(JSINIT_COMPLETED, (state, action) => {
    const { cachetoken, threedinit } = action.payload;

    return { ...state, cacheToken: cachetoken, jwt: threedinit, jsinitPending: false };
  }),
  on(JSINIT_FAILED, state => ({ ...state, jsinitPending: false })),
  on(UPDATE_CONFIG, (state, action) => {
    const { cachetoken: cacheToken, threedinit: jwt } = action.payload.init || {};

    return { ...state, cacheToken, jwt };
  })
);

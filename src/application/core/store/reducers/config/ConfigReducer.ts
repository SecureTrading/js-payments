import { IConfigState, INITIAL_STATE } from './IConfigState';
import { ActionName, IAction } from '../../IAction';
import { CLEAR_CONFIG, UPDATE_CONFIG } from './ConfigActions';

export function configReducer<T extends ActionName>(
  state: IConfigState = INITIAL_STATE,
  action: IAction<T>
): IConfigState {
  switch (action.type) {
    case UPDATE_CONFIG:
      return { ...state, config: action.payload };
    case CLEAR_CONFIG:
      return { ...state, config: null };
    default:
      return state;
  }
}

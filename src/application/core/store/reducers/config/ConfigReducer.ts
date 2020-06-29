import { IConfigState, INITIAL_STATE } from './IConfigState';
import { IAction } from '../../IAction';
import { IActionsMap } from '../../IActionsMap';
import { UPDATE_CONFIG } from './ConfigActions';

export function configReducer<T extends keyof IActionsMap>(
  state: IConfigState = INITIAL_STATE,
  action: IAction<T>
): IConfigState {
  switch (action.type) {
    case UPDATE_CONFIG:
      return { ...state, config: action.payload };
    default:
      return state;
  }
}

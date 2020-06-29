import { IActionsMap } from './IActionsMap';

export interface IAction<K extends keyof IActionsMap> {
  type: K;
  payload?: IActionsMap[K];
}

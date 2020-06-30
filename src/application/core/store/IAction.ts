import { IActionsMap } from './IActionsMap';

export type ActionName = keyof IActionsMap;

export interface IAction<K extends ActionName = ActionName> {
  type: K;
  payload?: IActionsMap[K];
}

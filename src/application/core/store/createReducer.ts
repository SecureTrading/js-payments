import { ActionName, IAction } from './IAction';
import { Reducer } from 'redux';

type Handler<S, K extends ActionName> = (state: S, action: IAction<K>) => S;
type ActionHandlerTuple<S> = [ActionName, Handler<S, ActionName>];

export function on<S, K extends ActionName>(action: K, handler: Handler<S, K>): [K, Handler<S, K>] {
  return [action, handler];
}

export function createReducer<S>(initialState: S, ...handlers: ActionHandlerTuple<S>[]): Reducer<S, IAction> {
  const handlersMap = new Map<ActionName, Handler<S, ActionName>>();

  handlers.forEach(([actionName, handler]) => {
    handlersMap.set(actionName, handler);
  });

  return (state: S = initialState, action: IAction) => {
    if (handlersMap.has(action.type)) {
      return handlersMap.get(action.type)(state, action);
    }

    return state;
  };
}

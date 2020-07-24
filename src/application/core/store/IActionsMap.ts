import { IConfigActionsMap } from './reducers/config/IConfigActionsMap';
import { IStorageActionsMap } from './reducers/storage/IStorageActionsMap';
import { ICardinalActionsMap } from './reducers/cardinal/ICardinalActionsMap';

export type IActionsMap = IConfigActionsMap & ICardinalActionsMap & IStorageActionsMap;

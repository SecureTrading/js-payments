import { IConfig } from '../../../shared/model/config/IConfig';
import { CLEAR_CONFIG, UPDATE_CONFIG } from './reducers/config/ConfigActions';
import { ISetItemPayload, SET_ITEM } from './reducers/storage/StorageActions';

export interface IActionsMap {
  [UPDATE_CONFIG]: IConfig;
  [CLEAR_CONFIG]: undefined;
  [SET_ITEM]: ISetItemPayload;
}

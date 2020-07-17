import { IConfig } from '../../../shared/model/config/IConfig';
import { UPDATE_CONFIG } from './reducers/config/ConfigActions';
import { ISetItemPayload, SET_ITEM } from './reducers/storage/StorageActions';

export interface IActionsMap {
  [UPDATE_CONFIG]: IConfig;
  [SET_ITEM]: ISetItemPayload;
}

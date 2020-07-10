import { IConfig } from '../../../shared/model/config/IConfig';
import { UPDATE_CONFIG } from './reducers/config/ConfigActions';

export interface IActionsMap {
  [UPDATE_CONFIG]: IConfig;
}

import { IConfig } from '../../../shared/model/config/IConfig';
import { CLEAR_CONFIG, UPDATE_CONFIG } from './reducers/config/ConfigActions';

export interface IActionsMap {
  [UPDATE_CONFIG]: IConfig;
  [CLEAR_CONFIG]: undefined;
}

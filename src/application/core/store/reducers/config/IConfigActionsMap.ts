import { IConfig } from '../../../../../shared/model/config/IConfig';

export const UPDATE_CONFIG = 'CONFIG/UPDATE_CONFIG';
export const CLEAR_CONFIG = 'CONFIG/CLEAR_CONFIG';

export interface IConfigActionsMap {
  [UPDATE_CONFIG]: IConfig;
  [CLEAR_CONFIG]: undefined;
}

import { IConfig } from '../../../../../shared/model/config/IConfig';

export interface IConfigState {
  config: IConfig;
}

export const INITIAL_STATE: IConfigState = {
  config: null
};

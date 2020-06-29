import { IConfig } from '../../../../../shared/model/config/IConfig';
import { DefaultConfig } from '../../../models/constants/config-resolver/DefaultConfig';

export interface IConfigState {
  config: IConfig;
}

export const INITIAL_STATE: IConfigState = {
  config: DefaultConfig
};

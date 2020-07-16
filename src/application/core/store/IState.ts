import { IConfigState } from './reducers/config/IConfigState';
import { IStorageState } from './reducers/storage/IStorageState';

export interface IState {
  config: IConfigState;
  storage: IStorageState;
}

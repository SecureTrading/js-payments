import { IConfigState } from './reducers/config/IConfigState';
import { IStorageState } from './reducers/storage/IStorageState';
import { ICardinalState } from './reducers/cardinal/ICardinalState';

export interface IState {
  config: IConfigState;
  storage: IStorageState;
  cardinal: ICardinalState;
}

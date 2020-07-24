import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';

export const JSINIT_STARTED = 'CARDINAL/JSINIT_STARTED';
export const JSINIT_COMPLETED = 'CARDINAL/JSINIT_COMPLETED';
export const JSINIT_FAILED = 'CARDINAL/JSINIT_FAILED';

export interface ICardinalActionsMap {
  [JSINIT_STARTED]: undefined;
  [JSINIT_COMPLETED]: IThreeDInitResponse;
  [JSINIT_FAILED]: any;
}

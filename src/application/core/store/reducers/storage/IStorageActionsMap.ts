export const SET_ITEM = 'STORAGE/SET_ITEM';

interface ISetItemPayload {
  key: string;
  value: any;
}

export interface IStorageActionsMap {
  [SET_ITEM]: ISetItemPayload;
}

export interface ICardinalState {
  cacheToken: string | null;
  jwt: string | null;
  jsinitPending: boolean;
}

export const INITIAL_STATE: ICardinalState = {
  cacheToken: null,
  jwt: null,
  jsinitPending: false
};

export interface IStJwtPayload {
  [key: string]: string;
}

export interface IStJwtObj {
  payload: IStJwtPayload;
}

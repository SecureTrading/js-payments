interface IStJwtPayload {
  [key: string]: string;
}

interface IStJwtObj {
  payload: IStJwtPayload;
}

export { IStJwtObj, IStJwtPayload };

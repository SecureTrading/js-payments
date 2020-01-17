interface IThreeDInitResponse {
  jwt: string;
  response: IThreeDInitResponseData;
}

interface IThreeDInitResponseData {
  cachetoken: string;
  customeroutput?: string;
  errorcode: string;
  errormessage: string;
  initReload?: string;
  requesttypedescription: string;
  threedinit: string;
  transactionstartedtimestamp: string;
}

export { IThreeDInitResponse, IThreeDInitResponseData };

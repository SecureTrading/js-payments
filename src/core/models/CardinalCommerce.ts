const onCardinalValidatedStatus = ['SUCCESS', 'NOACTION', 'FAILURE'];

interface IOnCardinalValidated {
  Validated: boolean;
  ActionCode: string;
  ErrorNumber: number;
  ErrorDescription: string;
}

interface IThreeDInitResponse {
  cachetoken: string;
  errorcode: string;
  errormessage: string;
  requesttypedescription: string;
  threedinit: string;
  transactionstartedtimestamp: string;
}

interface IThreeDQueryResponse {
  accounttypedescription: string;
  acquirerresponsecode: string;
  acquirertransactionreference: string;
  acsurl: string;
  enrolled: string;
  dccenabled: string;
  errorcode: string;
  errormessage: string;
  issuer: string;
  issuercountryiso2a: string;
  livestatus: string;
  maskedpan: string;
  merchantcountryiso2a: string;
  merchantname: string;
  merchantnumber: string;
  operatorname: string;
  paymenttypedescription: string;
  requesttypedescription: string;
  settleduedate: string;
  settlestatus: string;
  threedversion: string;
  threedpayload: string;
  transactionreference: string;
  tid: string;
  transactionstartedtimestamp: string;
}

interface IAuthorizePaymentResponse {
  threedresponse: string;
}

export {
  onCardinalValidatedStatus,
  IAuthorizePaymentResponse,
  IOnCardinalValidated,
  IThreeDQueryResponse,
  IThreeDInitResponse
};

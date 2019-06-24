const ON_CARDINAL_VALIDATED_STATUS = ['SUCCESS', 'NOACTION', 'FAILURE'];

const PAYMENT_BRAND: string = 'cca';
const PAYMENT_EVENTS = {
  BIN_PROCESS: 'bin.process',
  INIT: 'init',
  SETUP_COMPLETE: 'payments.setupComplete',
  VALIDATED: 'payments.validated'
};

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
  IAuthorizePaymentResponse,
  IOnCardinalValidated,
  IThreeDQueryResponse,
  IThreeDInitResponse,
  ON_CARDINAL_VALIDATED_STATUS,
  PAYMENT_BRAND,
  PAYMENT_EVENTS
};

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
  acquirertransactionreference: string;
  acsurl: string;
  enrolled: string;
  threedpayload: string;
  transactionreference: string;
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

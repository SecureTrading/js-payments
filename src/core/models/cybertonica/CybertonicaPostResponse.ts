export type ICybertonicaPostResponseStatus = 'ALLOW' | 'CHALLENGE' | 'DENY';

export interface ICybertonicaPostResponse {
  transactionreference: string;
  paymenttypedescription: string;
  rulecategoryflag: string;
  maskedpan: string;
  transactionstartedtimestamp: string;
  errormessage: string;
  accounttypedescription: string;
  errorcode: string;
  fraudcontrolshieldstatuscode: ICybertonicaPostResponseStatus;
  fraudcontrolreference: string;
  requesttypedescription: string;
  acquirerneuralscore: string;
  operatorname: string;
  livestatus: string;
}

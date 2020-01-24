export interface IAFCybertonica {
  _deviceId: number;
  _refferer: string;
  _sendEvents: void;
  _sendFingerprint: void;
  _sendPayload: void;
  _tid: string;
  addEvent: void;
  api_root: string;
  apiuser: string;
  collect_all: boolean;
  getInfoToSend: void;
  init: any;
  logEvent: void;
  postInfo: void;
}

export interface ICybertonicaInitQuery {
  deferInit: boolean;
  cybertonicaApiKey: string;
  expirydate: string;
  pan: string;
  securitycode: string;
}

export interface ICybertonicaPostQuery {
  expirydate: string;
  pan: string;
  securitycode: string;
  tid: string;
}

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

export interface ICybertonicaPostResponseStatus {
  status: 'ALLOW' | 'CHALLENGE' | 'DENY';
}

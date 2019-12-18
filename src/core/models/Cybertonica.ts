interface IAFCybertonica {
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

interface ICybertonicaInitQuery {
  deferInit: boolean;
  cybertonicaApiKey: string;
  expirydate: string;
  pan: string;
  securitycode: string;
}
interface ICybertonicaPostQuery {
  expirydate: string;
  pan: string;
  securitycode: string;
  tid: string;
}

interface ICybertonicaPostResponse {
  status: 'ALLOW' | 'CHALLENGE' | 'DENY';
}

export { IAFCybertonica, ICybertonicaInitQuery, ICybertonicaPostResponse, ICybertonicaPostQuery };

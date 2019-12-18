interface ICybertonicaPostQuery {
  t: number;
  timezone: number;
  extid: string;
  tid: string;
  ip: string;
  ext_fraud_sore: number;
  query: [];
  response_url: string;
}

interface IAfcybertonica {
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

interface ICybertonicaResponse {
  action: string;
  channel: string;
  id: string;
  rules: [];
  score: number;
  comments?: [];
  tags?: [];
}

export { IAfcybertonica, ICybertonicaPostQuery, ICybertonicaResponse };

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

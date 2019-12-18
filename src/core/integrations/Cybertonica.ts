import { environment } from '../../environments/environment';
import {
  IAFCybertonica,
  ICybertonicaInitQuery,
  ICybertonicaPostQuery,
  ICybertonicaPostResponse
} from '../models/Cybertonica';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import Notification from '../shared/Notification';

declare const AFCYBERTONICA: IAFCybertonica;

class Cybertonica {
  private static API_USER_NAME: string = 'test';
  private static LOAD_SCRIPT_LISTENER: string = 'load';
  private static SCRIPT_TARGET: string = 'head';
  private _messageBus: MessageBus;
  private _notification: Notification;
  private _postData: ICybertonicaPostQuery = { tid: '', pan: '', expirydate: '', securitycode: '' };
  private _scriptLoaded: boolean;
  private _sdkAddress: string;
  private _tid: string;

  constructor() {
    this._sdkAddress = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
    this._messageBus = new MessageBus();
    this._notification = new Notification();
    this._onInit();
  }

  private _loadSdk(): void {
    DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, this._sdkAddress).addEventListener(
      Cybertonica.LOAD_SCRIPT_LISTENER,
      () => {
        this._loadIntegrationScript()
          .then((response: boolean) => {
            this._publishLoadingStatus(response);
          })
          .catch((error: boolean) => {
            this._publishLoadingStatus(error);
          });
      }
    );
  }

  private _loadIntegrationScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._tid = AFCYBERTONICA.init(Cybertonica.API_USER_NAME);
      resolve((this._scriptLoaded = true));
      reject((this._scriptLoaded = false));
    });
  }

  private _publishLoadingStatus(status: boolean): void {
    this._messageBus.publishFromParent(
      {
        data: { cybertonicaLoadingStatus: status },
        type: MessageBus.EVENTS_PUBLIC.LOAD_CYBERTONICA
      },
      Selectors.CONTROL_FRAME_IFRAME
    );
  }

  private _publishPostResponse(status: ICybertonicaPostResponse) {
    this._messageBus.publishFromParent(
      {
        data: { cybertonicaResponse: status },
        type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
      },
      Selectors.CONTROL_FRAME_IFRAME
    );
  }

  private _onInit(): void {
    this._loadSdk();
    this._submitEventListener();
  }

  private _setPostData(tid: string, pan: string, expirydate: string, securitycode: string): ICybertonicaPostQuery {
    this._postData.tid = tid;
    this._postData.pan = pan;
    this._postData.expirydate = expirydate;
    this._postData.securitycode = securitycode;
    return this._postData;
  }

  private _postQuery(data: ICybertonicaPostQuery): Promise<{}> {
    return new Promise((resolve, reject) => {
      resolve(data);
      reject(false);
    });
  }

  private _submitEventListener(): void {
    this._messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.CYBERTONICA, (data: ICybertonicaInitQuery) => {
      const { pan, expirydate, securitycode } = data;
      this._setPostData(this._tid, pan, expirydate, securitycode);
      this._postQuery(this._postData)
        .then((response: ICybertonicaPostResponse) => this._publishPostResponse(response))
        .catch(error => {
          this._notification.error('Something went wrong :/', error);
          throw new Error('Something went wrong :/');
        });
    });
  }
}

export { Cybertonica };

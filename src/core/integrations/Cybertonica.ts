import { environment } from '../../environments/environment';
import { IAfcybertonica } from '../models/Cybertonica';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import Notification from '../shared/Notification';

declare const AFCYBERTONICA: IAfcybertonica;

class Cybertonica {
  private static API_USER_NAME: string = 'test';
  private static LOAD_SCRIPT_LISTENER: string = 'load';
  private static SCRIPT_TARGET: string = 'head';
  private _api_root: string;
  private _collect_all: boolean;
  private _deviceId: number;
  private _messageBus: MessageBus;
  private _notification: Notification;
  private _refferer: string;
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
        this._loadIntegrationScript();
        this._messageBus.publishFromParent(
          {
            type: MessageBus.EVENTS_PUBLIC.LOAD_CYBERTONICA
          },
          Selectors.CONTROL_FRAME_IFRAME
        );
      }
    );
  }

  private _loadIntegrationScript(): void {
    if (typeof AFCYBERTONICA !== undefined) {
      this._tid = AFCYBERTONICA.init(Cybertonica.API_USER_NAME);
      this._deviceId = AFCYBERTONICA._deviceId;
      this._refferer = AFCYBERTONICA._refferer;
      this._api_root = AFCYBERTONICA.api_root;
      this._collect_all = AFCYBERTONICA.collect_all;
    }
  }

  private _onInit(): void {
    this._loadSdk();
  }

  private _postData(): void {}
  private _getResponse(): void {}
  private _proceedTransaction(): void {}
}

export { Cybertonica };

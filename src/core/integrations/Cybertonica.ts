import { environment } from '../../environments/environment';
import {
  IAFCybertonica,
  ICybertonicaInitQuery,
  ICybertonicaPostQuery,
  ICybertonicaPostResponse
} from '../models/Cybertonica';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import Selectors from '../shared/Selectors';
import { Translator } from '../shared/Translator';
import GoogleAnalytics from './GoogleAnalytics';

declare const AFCYBERTONICA: IAFCybertonica;

class Cybertonica {
  private static API_USER_NAME: string = 'test';
  private static ERROR_KEY: string = 'An error occurred';
  private static LOAD_SCRIPT_LISTENER: string = 'load';
  private static LOCALE: string = 'locale';
  private static SCRIPT_TARGET: string = 'head';

  private _messageBus: MessageBus;
  private _notification: Notification;
  private _postData: ICybertonicaPostQuery = {
    expirydate: '',
    pan: '',
    response: { status: 'DENY' },
    securitycode: '',
    tid: ''
  };
  private _scriptLoaded: boolean;
  private _sdkAddress: string;
  private _tid: string;
  private _translator: Translator;

  constructor() {
    this._sdkAddress = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
    this._messageBus = new MessageBus();
    this._notification = new Notification();
    this._translator = new Translator(localStorage.getItem(Cybertonica.LOCALE));
    this._onInit();
  }

  private _onInit(): void {
    this._loadSdk();
    this._submitEventListener();
  }

  private _authorizePayment(data: ICybertonicaPostResponse): void {
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
    };
    this._messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
    GoogleAnalytics.sendGaData('event', 'Cybertonica', 'auth', 'Cybertonica auth completed');
  }

  private _loadIntegrationScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._tid = AFCYBERTONICA.init(Cybertonica.API_USER_NAME);
      resolve((this._scriptLoaded = true));
      reject((this._scriptLoaded = false));
    });
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

  private _postQuery(data: ICybertonicaPostQuery): Promise<{}> {
    data.response.status = 'CHALLENGE';
    // @TODO temporarly for test purposes - needs to have backend response here.
    return new Promise((resolve, reject) => (this._shouldPaymentProceed(data) ? resolve(data) : reject(false)));
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

  private _publishPostResponse(status: ICybertonicaPostResponse): ICybertonicaPostResponse {
    this._messageBus.publishFromParent(
      {
        data: status,
        type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
      },
      Selectors.CONTROL_FRAME_IFRAME
    );
    return status;
  }

  private _setPostData(tid: string, pan: string, expirydate: string, securitycode: string): ICybertonicaPostQuery {
    this._postData.tid = tid;
    this._postData.pan = pan;
    this._postData.expirydate = expirydate;
    this._postData.securitycode = securitycode;
    return this._postData;
  }

  private _shouldPaymentProceed = (data: ICybertonicaPostQuery): boolean =>
    data.response.status === 'ALLOW' || data.response.status === 'CHALLENGE';

  private _submitEventListener(): void {
    this._messageBus.subscribeOnParent(MessageBus.EVENTS_PUBLIC.CYBERTONICA, (data: ICybertonicaInitQuery) => {
      const { pan, expirydate, securitycode } = data;
      this._setPostData(this._tid, pan, expirydate, securitycode);
      this._postQuery(this._postData)
        .then((response: ICybertonicaPostResponse) => this._publishPostResponse(response))
        .then(response => this._authorizePayment(response))
        .catch(error => {
          this._notification.error(
            this._translator.translate(this._translator.translate(Cybertonica.ERROR_KEY)),
            error
          );
          throw new Error(this._translator.translate(Cybertonica.ERROR_KEY));
        });
    });
  }
}

export { Cybertonica };

import { environment } from '../../environments/environment';
import Utils from './Utils';

export default class MessageBus {
  private readonly _parentOrigin: string;
  private readonly _frameOrigin: string;
  private _subscriptions: any = {};

  public static SUBSCRIBERS: string = 'ST_SUBSCRIBERS';
  public static EVENTS = {
    CHANGE_CARD_NUMBER: 'CHANGE_CARD_NUMBER',
    CHANGE_EXPIRATION_DATE: 'CHANGE_EXPIRATION_DATE',
    CHANGE_SECURITY_CODE: 'CHANGE_SECURITY_CODE',
    NOTIFICATION_ERROR: 'NOTIFICATION_ERROR',
    NOTIFICATION_INFO: 'NOTIFICATION_INFO',
    NOTIFICATION_SUCCESS: 'NOTIFICATION_SUCCESS',
    NOTIFICATION_WARNING: 'NOTIFICATION_WARNING'
  };
  public static EVENTS_PUBLIC = {
    AUTH: 'AUTH',
    LOAD_CARDINAL: 'LOAD_CARDINAL',
    LOAD_CONTROL_FRAME: 'LOAD_CONTROL_FRAME',
    SUBMIT_FORM: 'SUBMIT_FORM',
    THREEDINIT: 'THREEDINIT',
    THREEDQUERY: 'THREEDQUERY'
  };

  constructor(parentOrigin?: string) {
    this._parentOrigin = parentOrigin;
    this._frameOrigin = environment.FRAME_URL;
    this.registerMessageListener();
  }

  private registerMessageListener() {
    window.addEventListener('message', (event: MessageEvent) => {
      let messageBusEvent: MessageBusEvent = event.data;
      let isPublicEvent = Utils.inArray(Object.keys(MessageBus.EVENTS_PUBLIC), messageBusEvent.type);
      let isCallbackAllowed =
        event.origin === this._frameOrigin || (event.origin === this._parentOrigin && isPublicEvent);
        let subscribersStore = window.sessionStorage.getItem(MessageBus.SUBSCRIBERS);

        subscribersStore = JSON.parse(subscribersStore);
        
      if (isCallbackAllowed && this._subscriptions[messageBusEvent.type]) {
        this._subscriptions[messageBusEvent.type](messageBusEvent.data);
      }
    });
  }

  publish(event: MessageBusEvent, publishToParent?: boolean) {
    let subscribersStore;

    if (publishToParent) {
      window.parent.postMessage(event, this._parentOrigin);
    } else {
      subscribersStore = window.sessionStorage.getItem(MessageBus.SUBSCRIBERS);
      subscribersStore = JSON.parse(subscribersStore);

      if (subscribersStore[event.type]) {
        subscribersStore[event.type].forEach((frame: string) => {
          // @ts-ignore
          window.parent.frames[frame].postMessage(event, this._frameOrigin);
        });
      }
    }
  }

  publishFromParent(event: MessageBusEvent, frameName: string) {
    // @ts-ignore
    window.frames[frameName].postMessage(event, this._frameOrigin);
  }

  subscribe(eventType: string, callback: any) {
    let subscribers;
    let subscriber = window.name;
    let subscribersStore = window.sessionStorage.getItem(MessageBus.SUBSCRIBERS);

    subscribersStore = JSON.parse(subscribersStore);
    subscribers = subscribersStore || {};
    // @ts-ignore
    subscribers[eventType] = subscribers[eventType] || [];

    // @ts-ignore
    if (!subscribers[eventType].includes(subscriber)) {
      // @ts-ignore
      subscribers[eventType].push(subscriber);
    }
    subscribersStore = JSON.stringify(subscribers);
    window.sessionStorage.setItem(MessageBus.SUBSCRIBERS, subscribersStore);
    this._subscriptions[eventType] = callback;
  }

  subscribeOnParent(eventType: string, callback: any) {
    this._subscriptions[eventType] = callback;
  }
}

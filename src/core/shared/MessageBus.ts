import { environment } from '../../environments/environment';
import Utils from './Utils';

export default class MessageBus {
  public static SUBSCRIBERS: string = 'ST_SUBSCRIBERS';
  public static EVENTS = {
    BLOCK_CARD_NUMBER: 'BLOCK_CARD_NUMBER',
    BLOCK_EXPIRATION_DATE: 'BLOCK_EXPIRATION_DATE',
    BLOCK_FORM: 'BLOCK_FORM',
    BLOCK_SECURITY_CODE: 'BLOCK_SECURITY_CODE',
    CHANGE_CARD_NUMBER: 'CHANGE_CARD_NUMBER',
    CHANGE_EXPIRATION_DATE: 'CHANGE_EXPIRATION_DATE',
    CHANGE_SECURITY_CODE: 'CHANGE_SECURITY_CODE',
    CHANGE_SECURITY_CODE_LENGTH: 'CHANGE_SECURITY_CODE_LENGTH',
    FOCUS_CARD_NUMBER: 'FOCUS_CARD_NUMBER',
    FOCUS_EXPIRATION_DATE: 'FOCUS_EXPIRATION_DATE',
    FOCUS_SECURITY_CODE: 'FOCUS_SECURITY_CODE',
    VALIDATE_CARD_NUMBER_FIELD: 'VALIDATE_CARD_NUMBER_FIELD',
    VALIDATE_EXPIRATION_DATE_FIELD: 'VALIDATE_EXPIRATION_DATE_FIELD',
    VALIDATE_FORM: 'VALIDATE_FORM',
    VALIDATE_MERCHANT_FIELD: 'VALIDATE_MERCHANT_FIELD',
    VALIDATE_SECURITY_CODE_FIELD: 'VALIDATE_SECURITY_CODE_FIELD'
  };
  public static EVENTS_PUBLIC = {
    BIN_PROCESS: 'BIN_PROCESS',
    LOAD_CARDINAL: 'LOAD_CARDINAL',
    LOAD_CONTROL_FRAME: 'LOAD_CONTROL_FRAME',
    NOTIFICATION: 'NOTIFICATION',
    PROCESS_PAYMENTS: 'PROCESS_PAYMENTS',
    SET_REQUEST_TYPES: 'SET_REQUEST_TYPES',
    SUBMIT_FORM: 'SUBMIT_FORM',
    THREEDINIT: 'THREEDINIT',
    THREEDQUERY: 'THREEDQUERY',
    TRANSACTION_COMPLETE: 'TRANSACTION_COMPLETE',
    UPDATE_MERCHANT_FIELDS: 'UPDATE_MERCHANT_FIELDS'
  };
  private readonly _parentOrigin: string;
  private readonly _frameOrigin: string;
  private _subscriptions: any = {};

  constructor(parentOrigin?: string) {
    this._parentOrigin = parentOrigin ? parentOrigin : '*';
    this._frameOrigin = new URL(environment.FRAME_URL).origin;
    this.registerMessageListener();
  }

  public publish(event: IMessageBusEvent, publishToParent?: boolean) {
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

  public publishFromParent(event: IMessageBusEvent, frameName: string) {
    // @ts-ignore
    window.frames[frameName].postMessage(event, this._frameOrigin);
  }

  public publishToSelf(event: IMessageBusEvent) {
    // @ts-ignore
    window.postMessage(event, window.location.origin);
  }

  public subscribe(eventType: string, callback: any) {
    let subscribers;
    const subscriber = window.name;
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

  public subscribeOnParent(eventType: string, callback: any) {
    this._subscriptions[eventType] = callback;
  }

  private _handleMessageEvent = (event: MessageEvent) => {
    const messageBusEvent: IMessageBusEvent = event.data;
    const isPublicEvent = Utils.inArray(Object.keys(MessageBus.EVENTS_PUBLIC), messageBusEvent.type);
    const isCallbackAllowed =
      event.origin === this._frameOrigin || (event.origin === this._parentOrigin && isPublicEvent);
    let subscribersStore = window.sessionStorage.getItem(MessageBus.SUBSCRIBERS);

    subscribersStore = JSON.parse(subscribersStore);

    if (isCallbackAllowed && this._subscriptions[messageBusEvent.type]) {
      this._subscriptions[messageBusEvent.type](messageBusEvent.data);
    }
  };

  private registerMessageListener() {
    window.addEventListener('message', this._handleMessageEvent);
  }
}

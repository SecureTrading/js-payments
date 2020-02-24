import { environment } from '../../environments/environment';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { Utils } from './Utils';

export class MessageBus {
  public static SUBSCRIBERS: string = 'ST_SUBSCRIBERS';
  public static EVENTS = {
    BLOCK_FORM: 'BLOCK_FORM',
    BLUR_CARD_NUMBER: 'BLUR_CARD_NUMBER',
    BLUR_EXPIRATION_DATE: 'BLUR_EXPIRATION_DATE',
    BLUR_SECURITY_CODE: 'BLUR_SECURITY_CODE',
    CALL_SUBMIT_EVENT: 'CALL_SUBMIT_EVENT',
    CHANGE_CARD_NUMBER: 'CHANGE_CARD_NUMBER',
    CHANGE_EXPIRATION_DATE: 'CHANGE_EXPIRATION_DATE',
    CHANGE_SECURITY_CODE: 'CHANGE_SECURITY_CODE',
    CHANGE_SECURITY_CODE_LENGTH: 'CHANGE_SECURITY_CODE_LENGTH',
    DESTROY: 'DESTROY',
    FOCUS_CARD_NUMBER: 'FOCUS_CARD_NUMBER',
    FOCUS_EXPIRATION_DATE: 'FOCUS_EXPIRATION_DATE',
    FOCUS_SECURITY_CODE: 'FOCUS_SECURITY_CODE',
    IS_CARD_WITHOUT_CVV: 'IS_CARD_WITHOUT_CVV',
    VALIDATE_CARD_NUMBER_FIELD: 'VALIDATE_CARD_NUMBER_FIELD',
    VALIDATE_EXPIRATION_DATE_FIELD: 'VALIDATE_EXPIRATION_DATE_FIELD',
    VALIDATE_FORM: 'VALIDATE_FORM',
    VALIDATE_MERCHANT_FIELD: 'VALIDATE_MERCHANT_FIELD',
    VALIDATE_SECURITY_CODE_FIELD: 'VALIDATE_SECURITY_CODE_FIELD',
    STORAGE_SET_ITEM: 'SET_STORAGE_ITEM',
    STORAGE_SYNCHRONIZE: 'SYNCHRONIZE_STORAGE',
    STORAGE_COMPONENT_READY: 'COMPONENT_STORAGE_READY',
  };
  public static EVENTS_PUBLIC = {
    BIN_PROCESS: 'BIN_PROCESS',
    BLOCK_CARD_NUMBER: 'BLOCK_CARD_NUMBER',
    BLOCK_EXPIRATION_DATE: 'BLOCK_EXPIRATION_DATE',
    BLOCK_SECURITY_CODE: 'BLOCK_SECURITY_CODE',
    BLUR_FIELDS: 'BLUR_FIELDS',
    BY_PASS_CARDINAL: 'BY_PASS_CARDINAL',
    BY_PASS_INIT: 'BY_PASS_INIT',
    LOAD_CARDINAL: 'LOAD_CARDINAL',
    LOAD_CONTROL_FRAME: 'LOAD_CONTROL_FRAME',
    NOTIFICATION: 'NOTIFICATION',
    PROCESS_PAYMENTS: 'PROCESS_PAYMENTS',
    RESET_JWT: 'RESET_JWT',
    SET_REQUEST_TYPES: 'SET_REQUEST_TYPES',
    SUBMIT_FORM: 'SUBMIT_FORM',
    THREEDINIT: 'THREEDINIT',
    THREEDQUERY: 'THREEDQUERY',
    TRANSACTION_COMPLETE: 'TRANSACTION_COMPLETE',
    UPDATE_JWT: 'UPDATE_JWT',
    UPDATE_MERCHANT_FIELDS: 'UPDATE_MERCHANT_FIELDS',
    SUBSCRIBE: 'SUBSCRIBE',
  };
  private static readonly DOM_EVENT_NAME = 'message';
  private readonly _parentOrigin: string;
  private readonly _frameOrigin: string;
  private _subscriptions: any = {};

  constructor(parentOrigin?: string) {
    this._parentOrigin = parentOrigin ? parentOrigin : '*';
    this._frameOrigin = new URL(environment.FRAME_URL).origin;
    this._registerMessageListener();
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
    if (window.frames[frameName]) {
      // @ts-ignore
      (window.frames[frameName] as Window).postMessage(event, this._frameOrigin);
    }
  }

  public publishToSelf(event: IMessageBusEvent) {
    // @ts-ignore
    window.postMessage(event, window.location.origin);
  }

  public subscribe(eventType: string, callback: any, subscriber?: string) {
    subscriber = subscriber || window.name;

    let subscribers;
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

    const cardFieldsBlockingEvents = [
      MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER,
      MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE,
      MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE
    ];

    if (window.name && cardFieldsBlockingEvents.includes(eventType)) {
      this.publish(
        {
          type: MessageBus.EVENTS_PUBLIC.SUBSCRIBE,
          data: {
            eventType,
            target: subscriber
          }
        },
        true
      );
    }
  }

  public subscribeOnParent(eventType: string, callback: any) {
    this._subscriptions[eventType] = callback;
  }

  private _handleMessageEvent = (event: MessageEvent) => {
    const messageBusEvent: IMessageBusEvent = event.data;
    const isPublicEvent = Utils.inArray(Object.keys(MessageBus.EVENTS_PUBLIC), messageBusEvent.type);
    const isCallbackAllowed =
      event.origin === this._frameOrigin || (event.origin === this._parentOrigin && isPublicEvent);

    if (messageBusEvent.type === MessageBus.EVENTS.DESTROY) {
      window.removeEventListener(MessageBus.DOM_EVENT_NAME, this._handleMessageEvent);

      return;
    }

    if (messageBusEvent.type === MessageBus.EVENTS_PUBLIC.SUBSCRIBE) {
      const { eventType, target } = messageBusEvent.data;
      // @ts-ignore
      this.subscribe(eventType, () => void 0, target);
    }

    if (isCallbackAllowed && this._subscriptions[messageBusEvent.type]) {
      this._subscriptions[messageBusEvent.type](messageBusEvent.data);
    }
  };

  private _registerMessageListener() {
    window.addEventListener(MessageBus.DOM_EVENT_NAME, this._handleMessageEvent);
  }
}

export default class MessageBus {
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
    LOAD_CARDINAL: 'LOAD_CARDINAL',
    LOAD_CONTROL_FRAME: 'LOAD_CONTROL_FRAME',
    THREEDINIT: 'THREEDINIT',
    THREEDQUERY: 'THREEDQUERY'
  };

  constructor() {
    this.registerMessageListener();
  }

  private registerMessageListener() {
    window.addEventListener('message', (event: MessageEvent) => {
      let messageBusEvent: MessageBusEvent;

      if (event.origin === window.origin) {
        messageBusEvent = event.data;
        this._subscriptions[messageBusEvent.type] && this._subscriptions[messageBusEvent.type](messageBusEvent.data);
      }
    });
  }

  publish(event: MessageBusEvent, isParentFrameBus?: boolean) {
    const parentOrigin: string = 'http://localhost:8080'; // @TODO: it should come from configuration sent by the merchant
    const frameOrigin: string = window.origin;
    let subscribersStore;

    if (isParentFrameBus) {
      window.parent.postMessage(event, parentOrigin);
    } else {
      subscribersStore = window.sessionStorage.getItem(MessageBus.SUBSCRIBERS);
      subscribersStore = JSON.parse(subscribersStore);

      // @ts-ignore
      if (subscribersStore[event.type]) {
        // @ts-ignore
        subscribersStore[event.type].forEach((frame: string) => {
          // @ts-ignore
          window.parent.frames[frame].postMessage(event, frameOrigin);
        });
      }
    }
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
}

export default class MessageBus {
  private _subscriptions: any = {};

  public static SUBSCRIBERS: string = 'ST_SUBSCRIBERS';
  public static EVENTS = {
    CARD_NUMBER_CHANGE: 'CARD_NUMBER_CHANGE',
    EXPIRATION_DATE_CHANGE: 'EXPIRATION_DATE_CHANGE',
    SECURITY_CODE_CHANGE: 'SECURITY_CODE_CHANGE'
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

  publish(event: MessageBusEvent) {
    let frameOrigin = window.origin;
    let subscribersStore = window.sessionStorage.getItem(MessageBus.SUBSCRIBERS);

    subscribersStore = JSON.parse(subscribersStore);

    // @ts-ignore
    subscribersStore[event.type].forEach((frame: string) => {
      // @ts-ignore
      window.parent.frames[frame].postMessage(event, frameOrigin);
    });
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

export default class MessageBus {
  private readonly _domain: string;
  private _subscriptions: any = {};

  static EVENTS = {
    PUBLISH: 'PUBLISH',
    SUBSCRIBE: 'SUBSCRIBE',
    CARD_NUMBER_CHANGE: 'CARD_NUMBER_CHANGE',
    EXPIRATION_DATE_CHANGE: 'EXPIRATION_DATE_CHANGE',
    SECURITY_CODE_CHANGE: 'SECURITY_CODE_CHANGE'
  };

  static EVENTS_PUBLIC = {
    ST_SUBMIT: 'ST_SUBMIT'
  };

  constructor() {
    this._domain = window.location.href;
    this.registerMessageListener();
  }

  private registerMessageListener() {
    window.addEventListener('message', (event: MessageEvent) => {
      let messageBusEvent: MessageBusEvent = event.data;

      switch (messageBusEvent.type) {
        case MessageBus.EVENTS.SUBSCRIBE:
          this._subscriptions[messageBusEvent.subscription.type] =
            this._subscriptions[messageBusEvent.subscription.type] || [];
          this._subscriptions[messageBusEvent.subscription.type].push(messageBusEvent.subscription.subscriber);
          break;

        case MessageBus.EVENTS.PUBLISH:
          let publishEvent: MessageBusEvent = {
            type: messageBusEvent.publish.type,
            data: messageBusEvent.publish.data
          };

          if (this._subscriptions[messageBusEvent.publish.type]) {
            this._subscriptions[messageBusEvent.publish.type].forEach((domain: string) => {
              for (let i = 0; i < window.frames.length; i++) {
                // @ts-ignore
                if (window.frames[i].location.href === domain) {
                  // @ts-ignore
                  window.frames[i].postMessage(publishEvent, this._domain);
                }
              }
            });
          }
          break;

        default:
          this._subscriptions[messageBusEvent.type] && this._subscriptions[messageBusEvent.type](messageBusEvent.data);
          break;
      }
    });
  }

  publish(event: MessageBusPublishEvent) {
    let messageBusEvent: MessageBusEvent = {
      type: MessageBus.EVENTS.PUBLISH,
      publish: {
        type: event.type,
        data: event.data
      }
    };
    window.parent.postMessage(messageBusEvent, this._domain);
  }

  subscribe(eventType: string, callback: any) {
    let messageBusEvent: MessageBusEvent = {
      type: MessageBus.EVENTS.SUBSCRIBE,
      subscription: {
        type: eventType,
        subscriber: this._domain
      }
    };

    this._subscriptions[eventType] = callback;
    if (eventType !== MessageBus.EVENTS_PUBLIC.ST_SUBMIT) {
      window.parent.postMessage(messageBusEvent, this._domain);
    }
  }
}

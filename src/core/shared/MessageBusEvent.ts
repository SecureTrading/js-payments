interface MessageBusEvent {
  type: string;
  data?: any;
  subscription?: {
    type: string;
    subscriber: string;
  };
  publish?: {
    type: string;
    data: any;
  };
}

interface MessageBusPublishEvent {
  type: string;
  data: any;
}

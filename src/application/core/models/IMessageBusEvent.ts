export interface IMessageBusEvent<T = any> {
  data?: T;
  type: string;
}

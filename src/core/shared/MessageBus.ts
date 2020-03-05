import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { Service } from 'typedi';
import { Observable, Subscribable } from 'rxjs';
import { InterFrameCommunicator } from '../services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../services/message-bus/FramesHub';
import { first, map } from 'rxjs/operators';
import { Selectors } from './Selectors';
import { PartialObserver, Unsubscribable } from 'rxjs/src/internal/types';
import { ofType } from '../services/message-bus/operators/ofType';
import { FrameCollection } from '../services/message-bus/interfaces/FrameCollection';

type ControlFrameWindow = Window & {messageBus: MessageBus};

@Service()
export class MessageBus implements Subscribable<IMessageBusEvent> {
  public static EVENTS = {
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
  };
  public static EVENTS_PUBLIC = {
    BIN_PROCESS: 'BIN_PROCESS',
    BLOCK_FORM: 'BLOCK_FORM',
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
    CALL_MERCHANT_ERROR_CALLBACK: 'CALL_MERCHANT_ERROR_CALLBACK',
    CALL_MERCHANT_SUCCESS_CALLBACK: 'CALL_MERCHANT_SUCCESS_CALLBACK',
    CALL_MERCHANT_SUBMIT_CALLBACK: 'CALL_MERCHANT_SUBMIT_CALLBACK',
    SUBMIT_FORM: 'SUBMIT_FORM',
    THREEDINIT_REQUEST: 'THREEDINIT_REQUEST',
    THREEDINIT_RESPONSE: 'THREEDINIT_RESPONSE',
    THREEDQUERY: 'THREEDQUERY',
    TRANSACTION_COMPLETE: 'TRANSACTION_COMPLETE',
    UPDATE_JWT: 'UPDATE_JWT',
    UPDATE_MERCHANT_FIELDS: 'UPDATE_MERCHANT_FIELDS',
    SUBSCRIBE: 'SUBSCRIBE',
  };
  private isControlFrame = window.name === Selectors.CONTROL_FRAME_IFRAME;

  constructor(private communicator: InterFrameCommunicator, private framesHub: FramesHub) {
    if (this.isControlFrame) {
      (window as any).messageBus = this;
    }
  }

  public publish<T>(event: IMessageBusEvent<T>, publishToParent?: boolean): void {
    this.framesHub
      .waitForFrame(Selectors.CONTROL_FRAME_IFRAME)
      .subscribe(controlFrame => this.communicator.send(event, controlFrame));

    if (publishToParent) {
      this.publishToParent(event);
    }
  }

  public subscribe<T>(observer?: PartialObserver<IMessageBusEvent<T>>): Unsubscribable;

  public subscribe<T>(
    next?: (value: IMessageBusEvent<T>) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Unsubscribable;

  /** @deprecated use RxJS implementation instead */
  public subscribe<T>(eventType: string, callback: (data: T) => void): Unsubscribable;

  public subscribe<T>(...args: any[]): Unsubscribable {
    if (!this.framesHub.isParentFrame && !this.isControlFrame) {
      return this.getControlFrameMessageBus().subscribe(messageBus => {
        messageBus.subscribe.apply(messageBus, args);
      });
    }

    if (typeof(args[0]) === 'string' && typeof(args[1]) === 'function') {
      const [eventType, callback] = args;

      return this.communicator.incomingEvent$.pipe(
        ofType(eventType),
        map((event: IMessageBusEvent<T>) => event.data),
      ).subscribe(callback);
    }

    return this.communicator.incomingEvent$.subscribe.apply(this.communicator.incomingEvent$, args);
  }

  /** @deprecated use publish() instead */
  public publishToSelf<T>(event: IMessageBusEvent<T>): void {
    this.publish(event);
  }

  /** @deprecated use subscribe() instead */
  public subscribeOnParent<T>(eventType: string, callback: (data: T) => void): Unsubscribable {
    return this.subscribe(eventType, callback);
  }

  private publishToParent<T>(event: IMessageBusEvent<T>): void {
    if (!Object.values(MessageBus.EVENTS_PUBLIC).includes(event.type)) {
      throw new Error(`Cannot publish private event "${event.type}" to parent frame.`);
    }

    this.communicator.send(event, Selectors.MERCHANT_PARENT_FRAME);
  }

  private getControlFrameMessageBus(): Observable<MessageBus> {
    return this.framesHub.waitForFrame(Selectors.CONTROL_FRAME_IFRAME).pipe(
      map(frameName => {
        const frames: FrameCollection = window.top.frames as FrameCollection;
        const controlFrame: ControlFrameWindow = frames[frameName] as ControlFrameWindow;

        return controlFrame.messageBus;
      }),
      first(),
    );
  }
}

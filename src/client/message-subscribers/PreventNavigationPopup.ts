import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { Inject, Service } from 'typedi';
import { MessageSubscriberToken } from '../../application/dependency-injection/InjectionTokens';
import { MessageBus } from '../../application/core/shared/MessageBus';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../application/core/shared/EventTypes';
import { filter, takeUntil } from 'rxjs/operators';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { WINDOW } from '../../shared/dependency-injection/InjectionTokens';

@Service({ id: MessageSubscriberToken, multiple: true })
export class PreventNavigationPopup implements IMessageSubscriber {
  constructor(@Inject(WINDOW) private window: Window) {}

  register(messageBus: MessageBus): void {
    const destroy = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = undefined;
    };

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.SUBMIT_FORM), takeUntil(destroy))
      .subscribe(() => this.window.addEventListener('beforeunload', beforeUnloadHandler));

    messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
        filter((event: IMessageBusEvent) => !event.data.acsurl), // we ignore 3dquery responses
        takeUntil(destroy)
      )
      .subscribe(() => this.window.removeEventListener('beforeunload', beforeUnloadHandler));
  }
}

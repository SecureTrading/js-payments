import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { Inject, Service } from 'typedi';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { takeUntil } from 'rxjs/operators';
import { MessageSubscriberToken, WINDOW } from '../../shared/dependency-injection/InjectionTokens';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';

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
      .pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK), takeUntil(destroy))
      .subscribe(() => this.window.removeEventListener('beforeunload', beforeUnloadHandler));
  }
}

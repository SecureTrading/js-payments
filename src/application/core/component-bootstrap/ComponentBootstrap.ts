import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { Container, Service } from 'typedi';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Store } from '../store/Store';
import { environment } from '../../../environments/environment';
import { MessageSubscriberRegistry } from '../../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { MessageBus } from '../shared/message-bus/MessageBus';
import { MessageSubscriberToken } from '../../../shared/dependency-injection/InjectionTokens';

@Service()
export class ComponentBootstrap {
  constructor(private frameIdentifier: FrameIdentifier) {}

  run<T>(frameName: string, componentClass: new (...args: any[]) => T): T {
    this.frameIdentifier.setFrameName(frameName);

    Container.get(MessageBus);
    Container.get(Store);
    Container.get(BrowserLocalStorage).init();
    Container.get(FramesHub).notifyReadyState();

    if (this.frameIdentifier.isControlFrame()) {
      Container.get(MessageSubscriberRegistry).register(...Container.getMany(MessageSubscriberToken));
    }

    const component = Container.get(componentClass);

    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);

    return component;
  }
}

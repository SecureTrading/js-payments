import { SentryService } from '../../shared/services/sentry/SentryService';
import { Container, Service } from 'typedi';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { environment } from '../../environments/environment';
import { MessageSubscriberRegistry } from '../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../shared/services/message-bus/FrameIdentifier';
import { Store } from '../../application/core/store/Store';
import { IConfig } from '../../shared/model/config/IConfig';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { MERCHANT_PARENT_FRAME } from '../../application/core/models/constants/Selectors';
import { MessageSubscriberToken } from '../../shared/dependency-injection/InjectionTokens';
import { ST } from '../st/ST';

@Service()
export class ClientBootstrap {
  constructor(private frameIdentifier: FrameIdentifier) {}

  run(config: IConfig): ST {
    this.frameIdentifier.setFrameName(MERCHANT_PARENT_FRAME);

    Container.get(MessageBus);
    Container.get(Store);
    Container.get(BrowserLocalStorage).init();
    Container.get(MessageSubscriberRegistry).register(...Container.getMany(MessageSubscriberToken));

    const st = Container.get(ST);

    Container.get(SentryService).init(environment.SENTRY_DSN, environment.SENTRY_WHITELIST_URLS);

    st.init(config);

    return st;
  }
}

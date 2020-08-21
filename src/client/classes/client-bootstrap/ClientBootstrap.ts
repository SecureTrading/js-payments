import { SentryService } from '../../../shared/services/sentry/SentryService';
import { Container, Service } from 'typedi';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { environment } from '../../../environments/environment';
import { MessageSubscriberRegistry } from '../../../shared/services/message-bus/MessageSubscriberRegistry';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { ST } from '../../ST';
import { Selectors } from '../../../application/core/shared/Selectors';
import { MessageBus } from '../../../application/core/shared/MessageBus';
import { Store } from '../../../application/core/store/Store';
import { MessageSubscriberToken } from '../../../application/dependency-injection/InjectionTokens';
import { IConfig } from '../../../shared/model/config/IConfig';

@Service()
export class ClientBootstrap {
  constructor(private frameIdentifier: FrameIdentifier) {}

  run(config: IConfig): ST {
    this.frameIdentifier.setFrameName(Selectors.MERCHANT_PARENT_FRAME);

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

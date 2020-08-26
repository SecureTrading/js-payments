import { PreventNavigationPopup } from './PreventNavigationPopup';
import { MessageBusMock } from '../../testing/mocks/MessageBusMock';
import { anyFunction, instance, mock, verify } from 'ts-mockito';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';

describe('PreventNavigationPopup', () => {
  let windowMock: Window;
  let messageBus: MessageBus;
  let preventNavigationPopup: PreventNavigationPopup;

  beforeEach(() => {
    windowMock = mock<Window>();
    messageBus = (new MessageBusMock() as unknown) as MessageBus;
    preventNavigationPopup = new PreventNavigationPopup(instance(windowMock));
    preventNavigationPopup.register(messageBus);
  });

  it('registers onbeforeunload listener on form submit', () => {
    messageBus.publish({ type: PUBLIC_EVENTS.SUBMIT_FORM, data: {} });

    verify(windowMock.addEventListener('beforeunload', anyFunction())).once();
  });

  it('unregisters onbeforeunload listener on transaction complete', () => {
    messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data: {} });

    verify(windowMock.removeEventListener('beforeunload', anyFunction())).once();
  });
});

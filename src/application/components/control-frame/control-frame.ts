import 'location-origin';
import 'url-polyfill';
import 'whatwg-fetch';
import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Container } from 'typedi';
import { MessageBus } from '../../core/shared/MessageBus';

(() => {
  const messageBus = Container.get(MessageBus);

  window.console.log = (...args) =>
    messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CONSOLE_LOG,
        data: { type: 'log', content: JSON.stringify(args) }
      },
      true
    );
  window.console.warn = (...args) =>
    messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CONSOLE_LOG,
        data: { type: 'warn', content: JSON.stringify(args) }
      },
      true
    );
  window.console.info = (...args) =>
    messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CONSOLE_LOG,
        data: { type: 'info', content: JSON.stringify(args) }
      },
      true
    );
  window.console.error = (...args) =>
    messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.CONSOLE_LOG,
        data: { type: 'error', content: 'aAAA ' + JSON.stringify(args) }
      },
      true
    );

  window.addEventListener('error', event => window.console.error(event));

  return Container.get(ControlFrame);
})();

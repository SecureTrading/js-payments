import Notification from '../../../src/core/shared/Notification';
import MessageBus from '../../../src/core/shared/MessageBus';

// given
describe('Notification', () => {
  let notify: Notification;

  // when
  beforeEach(() => {
    notify = new Notification();
    // @ts-ignore
    notify._messageBus.publish = jest.fn();
  });

  // given
  describe('error()', () => {
    // then
    it('should send error notification', () => {
      notify.error('abc');
      // @ts-ignore
      expect(notify._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'ERROR'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('info()', () => {
    // then
    it('should send info notification', () => {
      notify.info('abc');
      // @ts-ignore
      expect(notify._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'INFO'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('success()', () => {
    // then
    it('should send info success', () => {
      notify.success('abc');
      // @ts-ignore
      expect(notify._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'SUCCESS'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('warning()', () => {
    // then
    it('should send info warning', () => {
      notify.warning('abc');
      // @ts-ignore
      expect(notify._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'WARNING'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });
});

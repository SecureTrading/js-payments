import { Notification } from './Notification';
import { MessageBus } from './MessageBus';

// given
describe('Notification', () => {
  const { instance } = notificationFixture();
  // when
  beforeEach(() => {
    // @ts-ignore
    instance._messageBus.publish = jest.fn();
  });

  // given
  describe('error()', () => {
    // then
    it('should send error notification', () => {
      instance.error('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
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
      instance.info('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
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
      instance.success('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
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
      instance.warning('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'WARNING'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });
});

function notificationFixture() {
  const instance: Notification = new Notification();
  return { instance };
}

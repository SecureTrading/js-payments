import SpyInstance = jest.SpyInstance;
import NotificationFrame from '../../../src/components/notification-frame/NotificationFrame';
import { Translator } from '../../../src/core/shared/Translator';

// given
describe('NotificationFrame', () => {
  // when
  const { elementId, instance } = notificationFrameFixture();

  // given
  describe('_getElement()', () => {
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
    });

    // then
    it('should return DOM element instance', () => {
      let actual = NotificationFrame.getElement(elementId);
      expect(actual).toBeTruthy();
      expect(actual).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('ifFieldExists()', () => {
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
    });

    // then
    it('should return DOM element instance', () => {
      let actual = NotificationFrame.ifFieldExists();
      expect(actual).toBeTruthy();
      expect(actual).toBeInstanceOf(HTMLDivElement);
    });
  });

  // given
  describe('notificationFrameElement get and set', () => {
    // then
    it('should be able to set and get notificationFrameElement', () => {
      instance.notificationFrameElement = document.createElement('input');
      expect(instance.notificationFrameElement.tagName).toBe('INPUT');
    });
  });

  // given
  describe('_getMessageClass()', () => {
    // when
    let { messageClasses, messageTypes } = notificationFrameFixture();

    // then
    it(`should return ${messageClasses.errorMessage} class when input type is: ${messageTypes.error}`, () => {
      expect(NotificationFrame._getMessageClass(messageTypes.error)).toEqual(messageClasses.errorMessage);
    });

    // then
    it(`should return ${messageClasses.successMessage} class when input type is: ${messageTypes.success}`, () => {
      expect(NotificationFrame._getMessageClass(messageTypes.success)).toEqual(messageClasses.successMessage);
    });

    // then
    it(`should return ${messageClasses.warningMessage} class when input type is: ${messageTypes.warning}`, () => {
      expect(NotificationFrame._getMessageClass(messageTypes.warning)).toEqual(messageClasses.warningMessage);
    });

    // then
    it(`should return ${messageClasses.infoMessage} class when input type is: ${messageTypes.info}`, () => {
      expect(NotificationFrame._getMessageClass(messageTypes.info)).toEqual(messageClasses.infoMessage);
    });

    // then
    it('should return empty string when input type is not from required', () => {
      expect(NotificationFrame._getMessageClass('some strange type')).toEqual('');
    });
  });

  // given
  describe('_onMessage()', () => {
    // then
    it('should set messageBus listener', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn();
      // @ts-ignore
      instance._onMessage();
      // @ts-ignore
      expect(instance._messageBus.subscribe.mock.calls[0][0]).toBe('NOTIFICATION');
      // @ts-ignore
      expect(instance._messageBus.subscribe.mock.calls[0][1]).toBeInstanceOf(Function);
      // @ts-ignore
      expect(instance._messageBus.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('_notificationEvent()', () => {
    // then
    it('should set message and call other functions', () => {
      // @ts-ignore
      instance._insertContent = jest.fn();
      // @ts-ignore
      instance._setAttributeClass = jest.fn();

      // @ts-ignore
      instance._notificationEvent({
        type: 'error',
        content: 'my error content'
      });

      // @ts-ignore
      expect(instance._insertContent).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._setAttributeClass).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._message).toMatchObject({
        type: 'error',
        content: 'my error content'
      });
    });
  });

  // given
  describe('insertContent()', () => {
    let { elementId, errorMessage } = notificationFrameFixture();
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
      // @ts-ignore
      instance.notificationFrameElement = document.getElementById(elementId) as HTMLElement;
      instance._message = errorMessage;
      // @ts-ignore
      instance._insertContent();
    });

    // then
    it('should insert proper content to message container', () => {
      const elementText: string = instance.notificationFrameElement.textContent;
      expect(elementText).toEqual(errorMessage.content);
    });
  });

  // given
  describe('insertContent() translated', () => {
    let { elementId } = notificationFrameFixture();
    let instance = new NotificationFrame();

    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
      // @ts-ignore
      instance.notificationFrameElement = document.getElementById(elementId) as HTMLElement;
      instance._message = { content: 'Field is required', type: 'error' };
      instance._translator = new Translator('fr_FR');
      // @ts-ignore
      instance._insertContent();
    });

    // then
    it('should insert proper content to message container in french', () => {
      const elementText: string = instance.notificationFrameElement.textContent;
      expect(elementText).toEqual('Champ requis');
    });
  });

  // given
  describe('_errorMessageListener()', () => {
    let insertContentSpy: SpyInstance;
    let setAttributeClassSpy: SpyInstance;
    let insertContentMethod;
    let setAttributeClassMethod;
    const functionCalls = 1;
    const { errorMessage } = notificationFrameFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onMessage();
      // @ts-ignore
      insertContentSpy = jest.spyOn(instance, '_insertContent');
      // @ts-ignore
      setAttributeClassSpy = jest.spyOn(instance, '_setAttributeClass');
      // @ts-ignore
      insertContentMethod = instance._insertContent();
      // @ts-ignore
      setAttributeClassMethod = instance._setAttributeClass();
    });

    // then
    it('should set message data', () => {
      // @ts-ignore
      instance._onMessage();
      // @ts-ignore
      expect(instance._message).toMatchObject(errorMessage);
    });

    // then
    it(`should call insertContent(): ${functionCalls} time(s)`, () => {
      expect(insertContentSpy).toHaveBeenCalledTimes(functionCalls);
      insertContentSpy.mockRestore();
    });

    // then
    it(`should call setAttributeClass(): ${functionCalls} time(s)`, () => {
      expect(setAttributeClassSpy).toHaveBeenCalledTimes(functionCalls);
      setAttributeClassSpy.mockRestore();
    });
  });

  // given
  describe('_autoHide()', () => {
    // then
    it('should remove class after timeout', () => {
      // @ts-ignore
      NotificationFrame.NOTIFICATION_TTL = 0;
      instance.notificationFrameElement = document.createElement('div');
      instance.notificationFrameElement.className = 'hello world';
      expect(instance.notificationFrameElement.className).toBe('hello world');
      // @ts-ignore
      instance._autoHide('world');
      window.setTimeout(() => {
        expect(instance.notificationFrameElement.className).toBe('hello a');
      }, 50);
    });
  });

  // given
  describe('_setDataNotificationColorAttribute()', () => {
    const { instance } = notificationFrameFixture();

    // when
    beforeEach(() => {
      instance.notificationFrameElement.setAttribute = jest.fn();
    });

    // then
    it('should call setAttribute with red color', () => {
      // @ts-ignore
      instance._setDataNotificationColorAttribute(NotificationFrame.MESSAGE_TYPES.error);
      expect(instance.notificationFrameElement.setAttribute).toHaveBeenCalledWith('data-notification-color', 'red');
    });

    // then
    it('should call setAttribute with grey color', () => {
      // @ts-ignore
      instance._setDataNotificationColorAttribute(NotificationFrame.MESSAGE_TYPES.info);
      expect(instance.notificationFrameElement.setAttribute).toHaveBeenCalledWith('data-notification-color', 'grey');
    });

    // then
    it('should call setAttribute with green color', () => {
      // @ts-ignore
      instance._setDataNotificationColorAttribute(NotificationFrame.MESSAGE_TYPES.success);
      expect(instance.notificationFrameElement.setAttribute).toHaveBeenCalledWith('data-notification-color', 'green');
    });

    // then
    it('should call setAttribute with yellow color', () => {
      // @ts-ignore
      instance._setDataNotificationColorAttribute(NotificationFrame.MESSAGE_TYPES.warning);
      expect(instance.notificationFrameElement.setAttribute).toHaveBeenCalledWith('data-notification-color', 'yellow');
    });

    // then
    it('should call setAttribute with undefined color', () => {
      // @ts-ignore
      instance._setDataNotificationColorAttribute('some other types');
      expect(instance.notificationFrameElement.setAttribute).toHaveBeenCalledWith(
        'data-notification-color',
        'undefined'
      );
    });
  });

  // given
  describe('setAttributeClass()', () => {
    // when
    const { instance } = notificationFrameFixture();

    // then
    it('should add error class', () => {
      // @ts-ignore
      instance._message = { type: 'ERROR' };
      instance.notificationFrameElement = document.createElement('div');
      // @ts-ignore
      instance._autoHide = jest.fn();
      // @ts-ignore
      instance._setAttributeClass();
      expect(instance.notificationFrameElement.className).toBe('notification-frame--error');
      // @ts-ignore
      expect(instance._autoHide).toHaveBeenCalledTimes(1);
    });

    // then
    it('should add warning class', () => {
      // @ts-ignore
      instance._message = { type: 'WARNING' };
      instance.notificationFrameElement = document.createElement('div');
      // @ts-ignore
      instance._autoHide = jest.fn();
      // @ts-ignore
      instance._setAttributeClass();
      expect(instance.notificationFrameElement.className).toBe('notification-frame--warning');
      // @ts-ignore
      expect(instance._autoHide).toHaveBeenCalledTimes(1);
    });

    // then
    it(`shouldn't add unknown class`, () => {
      // @ts-ignore
      instance._message = { type: 'ANOTHER' };
      instance.notificationFrameElement = document.createElement('div');
      // @ts-ignore
      instance._autoHide = jest.fn();
      // @ts-ignore
      instance._setAttributeClass();
      expect(instance.notificationFrameElement.className).toBe('');
      // @ts-ignore
      expect(instance._autoHide).toHaveBeenCalledTimes(0);
    });
  });

  // given
  describe('insertContent()', () => {
    // then
    it('should set text content', () => {
      instance.notificationFrameElement = document.createElement('div');
      instance.notificationFrameElement.textContent = 'ORIGINAL';
      expect(instance.notificationFrameElement.textContent).toBe('ORIGINAL');
      // @ts-ignore
      instance._message = { type: 'error', content: 'NEW VALUE' };
      // @ts-ignore
      instance._insertContent();
      expect(instance.notificationFrameElement.textContent).toBe('NEW VALUE');
    });
  });

  // given
  describe('_autoHide()', () => {
    // then
    it('should set text content', () => {
      instance.notificationFrameElement = document.createElement('div');
      instance.notificationFrameElement.textContent = 'ORIGINAL';
      expect(instance.notificationFrameElement.textContent).toBe('ORIGINAL');
      // @ts-ignore
      instance._message = { type: 'error', content: 'NEW VALUE' };
      // @ts-ignore
      instance._insertContent();
      expect(instance.notificationFrameElement.textContent).toBe('NEW VALUE');
    });
  });

  // given
  describe('_autoHide()', () => {
    const notificationElementClass = 'some class';

    // when
    beforeEach(() => {
      instance.notificationFrameElement.classList.remove = jest.fn();
    });

    // then
    it('should window.setTimeout been called', () => {
      window.setTimeout = jest.fn();
      // @ts-ignore
      instance._autoHide(notificationElementClass);
      expect(window.setTimeout).toHaveBeenCalled();
    });

    // then
    it('should notificationElementClass has been removed', async () => {
      // @ts-ignore
      instance._autoHide(notificationElementClass);
      await window.setTimeout(() => {
        expect(instance.notificationFrameElement.className).toBe(notificationElementClass);
      }, 50);
    });
  });
});

function notificationFrameFixture() {
  const instance = new NotificationFrame();
  const messageTypes = {
    error: 'ERROR',
    success: 'SUCCESS',
    warning: 'WARNING',
    info: 'INFO'
  };

  const errorMessage = { type: 'error', content: 'Some example error' };

  const messageClasses = {
    errorMessage: 'notification-frame--error',
    successMessage: 'notification-frame--success',
    warningMessage: 'notification-frame--warning',
    infoMessage: 'notification-frame--info'
  };
  const notificationFrameHtml = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
  const elementId = 'st-notification-frame';
  document.body.innerHTML = notificationFrameHtml;
  return { elementId, errorMessage, instance, messageClasses, messageTypes, notificationFrameHtml };
}

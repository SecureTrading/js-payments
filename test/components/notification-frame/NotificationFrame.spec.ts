import NotificationFrame from '../../../src/components/notification-frame/NotificationFrame';
import { Translator } from '../../../src/core/shared/Translator';

// given
describe('Component NotificationFrame class', () => {
  // given
  const { elementId } = NotificationFrameFixture();
  let { instance } = NotificationFrameFixture();
  describe('NotificationFrame._getElement', () => {
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

  describe('NotificationFrame.ifFieldExists', () => {
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

  describe('NotificationFrame.notificationFrameElement get and set', () => {
    it('should be able to set and get notificationFrameElement', () => {
      instance.notificationFrameElement = document.createElement('input');
      expect(instance.notificationFrameElement.tagName).toBe('INPUT');
    });
  });

  // given
  describe('NotificationFrame._getMessageClass', () => {
    let { messageClasses } = NotificationFrameFixture();
    let { messageTypes } = NotificationFrameFixture();

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

  describe('NotificationFrame._onMessage', () => {
    it('should set messageBus listener', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn();
      instance._onMessage();
      // @ts-ignore
      expect(instance._messageBus.subscribe.mock.calls[0][0]).toBe('NOTIFICATION');
      // @ts-ignore
      expect(instance._messageBus.subscribe.mock.calls[0][1]).toBeInstanceOf(Function);
      // @ts-ignore
      expect(instance._messageBus.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('NotificationFrame._notificationEvent', () => {
    it('should set message and call other functions', () => {
      instance.insertContent = jest.fn();
      instance.setAttributeClass = jest.fn();

      // @ts-ignore
      instance._notificationEvent({
        type: 'error',
        content: 'my error content'
      });

      expect(instance.insertContent).toHaveBeenCalledTimes(1);
      expect(instance.setAttributeClass).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._message).toMatchObject({
        type: 'error',
        content: 'my error content'
      });
    });
  });

  // given
  describe('NotificationFrame.insertContent', () => {
    let { elementId, errorMessage } = NotificationFrameFixture();
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
      // @ts-ignore
      instance.notificationFrameElement = document.getElementById(elementId) as HTMLElement;
      instance._message = errorMessage;
      instance.insertContent();
    });

    // then
    it('should insert proper content to message container', () => {
      const elementText: string = instance.notificationFrameElement.textContent;
      expect(elementText).toEqual(errorMessage.content);
    });
  });

  describe('NotificationFrame.insertContent translated', () => {
    let { elementId } = NotificationFrameFixture();
    let instance = new NotificationFrame();
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
      // @ts-ignore
      instance.notificationFrameElement = document.getElementById(elementId) as HTMLElement;
      instance._message = { content: 'Field is required', type: 'error' };
      instance._translator = new Translator('fr_FR');
      instance.insertContent();
    });

    // then
    it('should insert proper content to message container in french', () => {
      const elementText: string = instance.notificationFrameElement.textContent;
      expect(elementText).toEqual('Champ requis');
    });
  });

  // given
  describe('NotificationFrame._errorMessageListener', () => {
    let insertContentSpy: any;
    let setAttributeClassSpy: any;
    let insertContentMethod;
    let setAttributeClassMethod;
    const functionCalls = 1;
    const { errorMessage } = NotificationFrameFixture();

    beforeEach(() => {
      instance._onMessage();
      insertContentSpy = jest.spyOn(instance, 'insertContent');
      setAttributeClassSpy = jest.spyOn(instance, 'setAttributeClass');
      insertContentMethod = instance.insertContent();
      setAttributeClassMethod = instance.setAttributeClass();
    });

    // then
    it('should set message data', () => {
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

  describe('NotificationFrame._autoHide', () => {
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

  describe('NotificationFrame._getAllowedStyles', () => {
    it('should return allowed styles', () => {
      // @ts-ignore
      let styles = instance._getAllowedStyles();
      expect(styles['background-color-notification']).toMatchObject({
        property: 'background-color',
        selector: '#st-notification-frame'
      });
      expect(styles['space-outset-notification-warning']).toMatchObject({
        property: 'margin',
        selector: 'notification-frame--warning#st-notification-frame'
      });
    });
  });

  describe('NotificationFrame.setAttributeClass', () => {
    beforeEach(() => {
      instance = new NotificationFrame();
    });

    it('should add error class', () => {
      // @ts-ignore
      instance._message = { type: 'ERROR' };
      instance.notificationFrameElement = document.createElement('div');
      // @ts-ignore
      instance._autoHide = jest.fn();
      instance.setAttributeClass();
      expect(instance.notificationFrameElement.className).toBe('notification-frame--error');
      // @ts-ignore
      expect(instance._autoHide).toHaveBeenCalledTimes(1);
    });

    it('should add warning class', () => {
      // @ts-ignore
      instance._message = { type: 'WARNING' };
      instance.notificationFrameElement = document.createElement('div');
      // @ts-ignore
      instance._autoHide = jest.fn();
      instance.setAttributeClass();
      expect(instance.notificationFrameElement.className).toBe('notification-frame--warning');
      // @ts-ignore
      expect(instance._autoHide).toHaveBeenCalledTimes(1);
    });

    it('shouldnt add unknown class', () => {
      // @ts-ignore
      instance._message = { type: 'ANOTHER' };
      instance.notificationFrameElement = document.createElement('div');
      // @ts-ignore
      instance._autoHide = jest.fn();
      instance.setAttributeClass();
      expect(instance.notificationFrameElement.className).toBe('');
      // @ts-ignore
      expect(instance._autoHide).toHaveBeenCalledTimes(0);
    });
  });

  describe('NotificationFrame.insertContent', () => {
    it('should set text content', () => {
      instance.notificationFrameElement = document.createElement('div');
      instance.notificationFrameElement.textContent = 'ORIGINAL';
      expect(instance.notificationFrameElement.textContent).toBe('ORIGINAL');
      // @ts-ignore
      instance._message = { type: 'error', content: 'NEW VALUE' };
      instance.insertContent();
      expect(instance.notificationFrameElement.textContent).toBe('NEW VALUE');
    });
  });
});

function NotificationFrameFixture() {
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
  return { elementId, errorMessage, instance, messageClasses, messageTypes, notificationFrameHtml };
}

import NotificationFrame from '../../../src/components/notification-frame/NotificationFrame';

// given
describe('Component NotificationFrame', () => {
  // given
  const { elementId } = NotificationFrameFixture();
  let { instance } = NotificationFrameFixture();
  describe('Method _getElement', () => {
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
    });
    // then
    it('should return DOM element instance', () => {
      expect(NotificationFrame._getElement(elementId)).toBeTruthy();
    });
  });

  // given
  describe('Method _getMessageClass', () => {
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
    it(`should return ${messageClasses.cancelMessage} class when input type is: ${messageTypes.cancel}`, () => {
      expect(NotificationFrame._getMessageClass(messageTypes.cancel)).toEqual(messageClasses.cancelMessage);
    });

    // then
    it('should return empty string when input type is not from required', () => {
      expect(NotificationFrame._getMessageClass('some strange type')).toEqual('');
    });
  });

  // given
  describe('Method insertContent', () => {
    let { errorMessage } = NotificationFrameFixture();
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
      // @ts-ignore
      instance._message = errorMessage;
      instance.insertContent();
    });

    // then
    it('should insert proper content to message container', () => {
      const elementText: string = (document.getElementById(elementId) as HTMLElement).textContent;
      expect(elementText).toEqual(errorMessage.content);
    });
  });

  // given
  describe('Method setAttributeClass', () => {
    let { errorMessage, messageClasses } = NotificationFrameFixture();
    // when
    beforeEach(() => {
      document.body.innerHTML = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
      // @ts-ignore
      instance._message = errorMessage;
      instance.setAttributeClass();
    });

    // then
    it('should set proper class to message container', () => {
      const elementClass: string = (document.getElementById(elementId) as HTMLElement).getAttribute('class');
      expect(elementClass).toEqual(messageClasses.errorMessage);
    });
  });
  // given
  describe('Method _errorMessageListener', () => {
    let insertContentSpy: any;
    let setAttributeClassSpy: any;
    let insertContentMethod;
    let setAttributeClassMethod;
    const functionCalls = 1;

    beforeEach(() => {
      instance._errorMessageListener();
      insertContentSpy = jest.spyOn(instance, 'insertContent');
      setAttributeClassSpy = jest.spyOn(instance, 'setAttributeClass');
      insertContentMethod = instance.insertContent();
      setAttributeClassMethod = instance.setAttributeClass();
    });

    // then
    it('should set message data', () => {});

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
});

function NotificationFrameFixture() {
  const instance = new NotificationFrame();
  const messageTypes = {
    error: 'error',
    success: 'success',
    cancel: 'cancel'
  };

  const errorMessage = { type: 'error', content: 'some error content' };

  const messageClasses = {
    errorMessage: 'notification-frame--error',
    successMessage: 'notification-frame--success',
    cancelMessage: 'notification-frame--cancel'
  };
  const notificationFrameHtml = '<div id="st-notification-frame" class="notification-frame">Some example error</div>';
  const elementId = 'st-notification-frame';
  return { elementId, errorMessage, instance, messageClasses, messageTypes, notificationFrameHtml };
}

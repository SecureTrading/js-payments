import CardFrames from '../../../src/core/classes/CardFrames.class';
import DomMethods from '../../../src/core/shared/DomMethods';
import Language from '../../../src/core/shared/Language';
import MessageBus from '../../../src/core/shared/MessageBus';
import Selectors from '../../../src/core/shared/Selectors';

// given
describe('CardFrames', () => {
  // given
  describe('_disableFormField', () => {
    const { instance } = cardFramesFixture();
    const data = true;
    const type = MessageBus.EVENTS.BLOCK_CARD_NUMBER;
    const messageBusEvent = {
      data,
      type
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      // @ts-ignore
      instance._disableFormField(data, type);
    });

    // then
    it('should call publish method', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  // given
  describe('_disableSubmitButton', () => {
    const { instance } = cardFramesFixture();
    const element = document.createElement('button');
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._getSubmitButton = jest.fn().mockReturnValueOnce(element);
      // @ts-ignore
      instance._setSubmitButtonProperties = jest.fn();
      // @ts-ignore
      instance._disableSubmitButton(true);
    });

    // then
    it('should call _getSubmitButton', () => {
      // @ts-ignore
      expect(instance._getSubmitButton).toHaveBeenCalled();
    });
    // then
    it('should call _setSubmitButtonProperties', () => {
      // @ts-ignore
      expect(instance._setSubmitButtonProperties).toHaveBeenCalled();
    });
  });

  // given
  describe('_onInput', () => {
    const { instance } = cardFramesFixture();
    const messageBusEvent = {
      data: {},
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publishFromParent = jest.fn();
      // @ts-ignore
      instance._onInput();
    });

    // then
    it('should call publishFromParent method', () => {
      // @ts-ignore
      expect(instance._messageBus.publishFromParent).toHaveBeenCalledWith(
        messageBusEvent,
        Selectors.CONTROL_FRAME_IFRAME
      );
    });
  });

  // given
  describe('_setMerchantInputListeners', () => {
    const { instance } = cardFramesFixture();
    const element = document.createElement('input');
    // when
    beforeEach(() => {
      DomMethods.getAllFormElements = jest.fn().mockReturnValueOnce(element);
      // @ts-ignore
      instance._setMerchantInputListeners();
    });

    // then
    it('should add event listener to each input', () => {
      expect(DomMethods.getAllFormElements).toBeCalled();
    });
  });

  // given
  describe('_submitFormListener', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._publishSubmitEvent = jest.fn();
    });

    // then
    it('should call preventDefault and publishSubmitEvent method', () => {
      document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          const submitEvent = new Event(event);
          submitEvent.preventDefault = jest.fn();
          callback(submitEvent);
        });
      // @ts-ignore
      instance._submitFormListener();
      // @ts-ignore
      expect(instance._publishSubmitEvent).toHaveBeenCalled();
    });
  });

  // given
  describe('_subscribeBlockSubmit', () => {
    const { instance } = cardFramesFixture();

    // then
    it('should subscribe listener been called', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn();
      // @ts-ignore
      instance._subscribeBlockSubmit();
      // @ts-ignore
      expect(instance._messageBus.subscribe).toHaveBeenCalled();
    });

    // then
    it('should call disableSubmitButton method when BLOCK_FORM event has been called', () => {
      // @ts-ignore
      instance._disableSubmitButton = jest.fn();
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(true);
      });
      // @ts-ignore
      instance._subscribeBlockSubmit();
      // @ts-ignore
      instance._messageBus.publish({ data: true, type: MessageBus.EVENTS.BLOCK_FORM }, true);
      // @ts-ignore
      expect(instance._disableSubmitButton).toHaveBeenCalled();
    });
  });

  // given
  describe('_publishSubmitEvent', () => {
    const { instance } = cardFramesFixture();
    const submitFormEvent = {
      data: {
        // @ts-ignore
        updateJWT: undefined
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publishFromParent = jest.fn();
      // @ts-ignore
      instance._publishSubmitEvent();
    });

    // then
    it('should call publishFromParent method', () => {
      // @ts-ignore
      expect(instance._messageBus.publishFromParent).toHaveBeenCalledWith(submitFormEvent, 'st-control-frame-iframe');
    });
  });

  // given
  describe('_validateFieldsAfterSubmit', () => {
    const { instance } = cardFramesFixture();

    function validateFieldsAfterSubmitFixture(
      stateCardNumber: boolean,
      stateExpirationDate: boolean,
      stateSecurityCode: boolean
    ) {
      return {
        cardNumber: { message: 'card', state: stateCardNumber },
        expirationDate: { message: 'expiration', state: stateExpirationDate },
        securityCode: { message: 'security', state: stateSecurityCode }
      };
    }

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._publishValidatedFieldState = jest.fn();
    });

    // then
    it(`should call _publishValidatedFieldState for cardNumber if it's state is false`, () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
        callback(validateFieldsAfterSubmitFixture(false, true, true));
      });
      // @ts-ignore
      instance._validateFieldsAfterSubmit();
      // @ts-ignore
      expect(instance._publishValidatedFieldState.mock.calls[0][0]).toEqual({ message: 'card', state: false });
      // @ts-ignore
      expect(instance._publishValidatedFieldState.mock.calls[0][1]).toEqual(
        MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD
      );
    });

    // then
    it(`should call _publishValidatedFieldState for expirationDate if it's state is false`, () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
        callback(validateFieldsAfterSubmitFixture(true, false, true));
      });

      // @ts-ignore
      instance._validateFieldsAfterSubmit();
      // @ts-ignore
      expect(instance._publishValidatedFieldState.mock.calls[0][0]).toEqual({ message: 'expiration', state: false });
      // @ts-ignore
      expect(instance._publishValidatedFieldState.mock.calls[0][1]).toEqual(
        MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD
      );
    });

    // then
    it(`should call _publishValidatedFieldState for securityCode if it's state is false`, () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
        callback(validateFieldsAfterSubmitFixture(true, true, false));
      });

      // @ts-ignore
      instance._validateFieldsAfterSubmit();
      // @ts-ignore
      expect(instance._publishValidatedFieldState.mock.calls[0][0]).toEqual({ message: 'security', state: false });
      // @ts-ignore
      expect(instance._publishValidatedFieldState.mock.calls[0][1]).toEqual(
        MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD
      );
    });
  });

  // given
  describe('_publishValidatedFieldState', () => {
    const { instance } = cardFramesFixture();
    const field = { message: 'fuuuuuu', state: true };
    const eventType = MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD;
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      // @ts-ignore
      instance._publishValidatedFieldState(field, eventType);
    });

    // then
    it('should set messageBusEvent properties', () => {
      // @ts-ignore
      expect(instance._messageBusEvent.type).toEqual(MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
      // @ts-ignore
      expect(instance._messageBusEvent.data.message).toEqual(field.message);
    });

    // then
    it('should set messageBusEvent properties', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
        type: MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD,
        data: { message: field.message }
      });
    });
  });

  // given
  describe('_setSubmitButtonProperties', () => {
    const { instance } = cardFramesFixture();
    const button = document.createElement('button');
    button.setAttribute('type', 'submit');
    // then
    it('should mark button as disabled when disabledState is true', () => {
      // @ts-ignore
      instance._setSubmitButtonProperties(button, true);
      expect(button.textContent).toEqual(`${Language.translations.PROCESSING} ...`);
      // @ts-ignore
      expect(button.classList.contains(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS)).toEqual(true);
      expect(button.disabled).toEqual(true);
    });

    // then
    it('should remove disabled attributes from button when disabledState is false', () => {
      // @ts-ignore
      instance._setSubmitButtonProperties(button, false);
      expect(button.textContent).toEqual(Language.translations.PAY);
      // @ts-ignore
      expect(button.classList.contains(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS)).toEqual(false);
      expect(button.disabled).toEqual(false);
    });
  });
});

function cardFramesFixture() {
  const html =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"><div id="st-card-number"></div><div id="st-expiration-date"></div><div id="st-security-code"></div><div id="st-animated-card"></div><button type="submit">Submit </button></form>';
  document.body.innerHTML = html;
  const instance = new CardFrames(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTYyODU0NjQ3LjgyNTUyMTIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJsb2NhbGUiOiJlbl9HQiJ9fQ.vqCAI0quQ2oShuirr6iRGNgVfv2YsR_v3Q9smhVx5PM',
    'localhost',
    {
      animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
      cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
      expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
      notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
      securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
    },
    {},
    ['VISA,MASTERCARD,AMEX'],
    'AMEX',
    true,
    false
  );
  return { instance };
}

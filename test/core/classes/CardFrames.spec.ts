import { CardFrames } from '../../../src/core/classes/CardFrames.class';
import { BypassCards } from '../../../src/core/models/constants/BypassCards';
import { FormState } from '../../../src/core/models/constants/FormState';
import { DomMethods } from '../../../src/core/shared/DomMethods';
import { Language } from '../../../src/core/shared/Language';
import { MessageBus } from '../../../src/core/shared/MessageBus';
import { Selectors } from '../../../src/core/shared/Selectors';

// given
describe('CardFrames', () => {
  // given
  describe('_disableFormField', () => {
    const { instance } = cardFramesFixture();
    const data = true;
    const type = MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER;
    const messageBusEvent = {
      data,
      type
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._broadcastSecurityCodeProperties = jest.fn();
      // @ts-ignore
      instance.messageBus.publishFromParent = jest.fn();
      // @ts-ignore
      instance._disableFormField(data, type, Selectors.CARD_NUMBER_IFRAME);
    });

    // then
    it('should call publishFromParent method', () => {
      // @ts-ignore
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(messageBusEvent, Selectors.CARD_NUMBER_IFRAME);
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
    it('should call _setSubmitButtonProperties', () => {
      // @ts-ignore
      expect(instance._setSubmitButtonProperties).toHaveBeenCalled();
    });
  });

  // given
  describe('_onInput', () => {
    const { instance } = cardFramesFixture();
    const messageBusEvent = {
      data: {
        billingamount: '',
        billingemail: '',
        billingfirstname: ''
      },
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance.messageBus.publishFromParent = jest.fn();
      // @ts-ignore
      instance._onInput();
    });

    // then
    it('should call publishFromParent method', () => {
      // @ts-ignore
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(
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
      // @ts-ignore
      instance._submitButton.addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
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
      instance.messageBus.subscribe = jest.fn();
      // @ts-ignore
      instance._subscribeBlockSubmit();
      // @ts-ignore
      expect(instance.messageBus.subscribe).toHaveBeenCalled();
    });

    // then
    it('should call disableSubmitButton method when BLOCK_FORM event has been called', () => {
      // @ts-ignore
      instance._disableSubmitButton = jest.fn();
      // @ts-ignore
      instance.messageBus.subscribe = jest.fn().mockImplementation((event, callback) => {
        callback(true);
      });
      // @ts-ignore
      instance._subscribeBlockSubmit();
      // @ts-ignore
      instance.messageBus.publish({ data: true, type: MessageBus.EVENTS.BLOCK_FORM });
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
        deferInit: undefined,
        fieldsToSubmit: ['pan', 'expirydate', 'securitycode'],
        bypassCards: ['PIBA']
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance.messageBus.publishFromParent = jest.fn();
      // @ts-ignore
      instance._publishSubmitEvent();
    });

    // then
    it('should call publishFromParent method', () => {
      // @ts-ignore
      expect(instance.messageBus.publishFromParent).toHaveBeenCalledWith(submitFormEvent, 'st-control-frame-iframe');
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
      instance.messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
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
      instance.messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
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
      instance.messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
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
      instance.messageBus.publish = jest.fn();
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
      expect(instance.messageBus.publish).toHaveBeenCalledWith({
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
    it('should mark button as disabled when form state is blocked', () => {
      // @ts-ignore
      instance._setSubmitButtonProperties(button, FormState.BLOCKED);
      expect(button.textContent).toEqual(`${Language.translations.PROCESSING} ...`);
      // @ts-ignore
      expect(button.classList.contains(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS)).toEqual(true);
      expect(button.disabled).toEqual(true);
    });

    // then
    it('should mark button as disabled when form state is complete but text should be pay', () => {
      // @ts-ignore
      instance._setSubmitButtonProperties(button, FormState.COMPLETE);
      expect(button.textContent).toEqual(Language.translations.PAY);
      // @ts-ignore
      expect(button.classList.contains(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS)).toEqual(true);
      expect(button.disabled).toEqual(true);
    });

    // then
    it('should remove disabled attributes from button when form state is available', () => {
      // @ts-ignore
      instance._setSubmitButtonProperties(button, FormState.AVAILABLE);
      expect(button.textContent).toEqual(Language.translations.PAY);
      // @ts-ignore
      expect(button.classList.contains(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS)).toEqual(false);
      expect(button.disabled).toEqual(false);
    });
  });

  // given
  describe('_setSubmitButton', () => {
    const { instance } = cardFramesFixture();
    // then
    it('should return button referred to id specified by merchant', () => {
      // @ts-ignore
      expect(instance._createSubmitButton()).toEqual(document.getElementById('merchant-submit-button'));
    });

    it('should return first given submit button which has been specified in form', () => {
      // @ts-ignore
      instance._buttonId = 'blah';
      // @ts-ignore
      expect(instance._createSubmitButton().nodeName).toEqual('BUTTON');
      // @ts-ignore
      expect(instance._createSubmitButton().getAttribute('class')).toEqual('example-form__button');
      // @ts-ignore
      expect(instance._createSubmitButton().getAttribute('type')).toEqual('submit');
    });

    // then
    it('should return first given submit input when buttonID is not specified', () => {
      // @ts-ignore
      instance._buttonId = undefined;
      // @ts-ignore
      expect(instance._createSubmitButton().nodeName).toEqual('BUTTON');
      // @ts-ignore
      expect(instance._createSubmitButton().getAttribute('class')).toEqual('example-form__button');
      // @ts-ignore
      expect(instance._createSubmitButton().getAttribute('type')).toEqual('submit');
    });
  });
});

function cardFramesFixture() {
  document.body.innerHTML =
    '<form id="st-form" class="example-form" autocomplete="off" novalidate> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label">AMOUNT</label> <input id="example-form-amount" class="example-form__input" type="number" placeholder="" name="myBillAmount" data-st-name="billingamount" /> </div> </div> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" name="myBillName" data-st-name="billingfirstname" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" name="myBillEmail" data-st-name="billingemail" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" name="myBillTel" /> <!-- no data-st-name attribute so this field will not be submitted to ST --> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group example-form__group--submit"> <button type="submit" class="example-form__button">Back</button> <button type="submit" class="example-form__button" id="merchant-submit-button">Submit</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  const instance = new CardFrames(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NTM2NzE1OC44NDk1NDUyLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiMzA4OTUwMDAwMDAwMDAwMDAyMSIsImV4cGlyeWRhdGUiOiIwMS8yMiJ9fQ.ey0e7_JVcwXinHZR-MFBWARiVy6F3GU5JrcuCgicGhU',
    'localhost',
    {
      cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
      expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
      securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
    },
    {},
    ['VISA,MASTERCARD,AMEX'],
    'AMEX',
    true,
    false,
    'merchant-submit-button',
    false,
    ['pan', 'expirydate', 'securitycode'],
    [BypassCards.PIBA]
  );
  instance.init();
  return { instance };
}

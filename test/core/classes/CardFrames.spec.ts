import CardFrames from '../../../src/core/classes/CardFrames.class';
import MessageBus from '../../../src/core/shared/MessageBus';
import Selectors from '../../../src/core/shared/Selectors';

// given
describe('CardFrames', () => {
  // given
  describe('onInit', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('registerElements', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('setElementsFields', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

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
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._getSubmitButton = jest.fn();
      // @ts-ignore
      instance._disableSubmitButton(true);
    });

    // then
    it('', () => {
      // @ts-ignore
      expect(instance._getSubmitButton).toHaveBeenCalled();
    });
  });

  // given
  describe('_getSubmitButton', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('_initCardFields', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('_initSubscribes', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
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
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('_submitFormListener', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('_subscribeBlockSubmit', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });

  // given
  describe('_publishSubmitEvent', () => {
    const { instance } = cardFramesFixture();
    const submitFormEvent = {
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      // @ts-ignore
      instance._publishSubmitEvent();
    });

    // then
    it('should call publish method', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(submitFormEvent);
    });
  });

  // given
  describe('_validateFieldsAfterSubmit', () => {
    const { instance } = cardFramesFixture();
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
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
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
  });
});

function cardFramesFixture() {
  const html =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"><div id="st-card-number"></div><div id="st-expiration-date"></div><div id="st-security-code"></div><div id="st-animated-card"></div><button type="submit">Submit </form>';
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
    'AMEX'
  );
  return { instance };
}

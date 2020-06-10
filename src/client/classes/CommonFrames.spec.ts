import { CommonFrames } from './CommonFrames.class';
import { MessageBus } from '../../application/core/shared/MessageBus';
import { Selectors } from '../../application/core/shared/Selectors';
import { MessageBusMock } from '../../testing/mocks/MessageBusMock';
import { PUBLIC_EVENTS } from '../../application/core/shared/EventTypes';

jest.mock('./../../../src/application/core/shared/Notification');

// given
describe('CommonFrames', () => {
  // given
  describe('_isThreedComplete()', () => {
    // when
    const { instance } = commonFramesFixture();

    function isThreedComplete(requestTypes: string[], dataArg: {}) {
      // @ts-ignore
      instance._requestTypes = [...requestTypes];
      // @ts-ignore
      return instance._isThreedComplete({ ...dataArg });
    }

    // then
    it('should be complete', () => {
      expect(isThreedComplete(['THREEDQUERY'], { requesttypedescription: 'THREEDQUERY' })).toEqual(true);
    });

    // then
    it('should not be complete if not a THREEDQUERY', () => {
      expect(isThreedComplete(['THREEDQUERY'], { requesttypedescription: 'RISKDEC' })).toEqual(false);
    });

    // then
    it('should not be complete if THREEDQUERY not last request type', () => {
      expect(isThreedComplete(['THREEDQUERY', 'AUTH'], { requesttypedescription: 'THREEDQUERY' })).toEqual(false);
    });

    // then
    it('should not be complete if THREEDQUERY but enrolled and non-frictionless', () => {
      expect(
        isThreedComplete(['THREEDQUERY'], {
          acsurl: 'https://example.com',
          enrolled: 'Y',
          requesttypedescription: 'THREEDQUERY'
        })
      ).toEqual(false);
    });

    // then
    it('should not be complete if THREEDQUERY but enrolled unless threedresponse is available', () => {
      expect(
        isThreedComplete(['THREEDQUERY'], {
          acsurl: 'https://example.com',
          enrolled: 'Y',
          requesttypedescription: 'THREEDQUERY',
          threedresponse: 'somedata'
        })
      ).toEqual(true);
    });
  });

  // given
  describe('_isTransactionFinished()', () => {
    // when
    const { instance } = commonFramesFixture();

    function isTransactionFinishedFixture(dataArg: {}) {
      const data = { ...dataArg };
      // @ts-ignore
      return instance._isTransactionFinished(data);
    }

    // then
    it('should be finished if AUTH', () => {
      expect(isTransactionFinishedFixture({ requesttypedescription: 'AUTH' })).toEqual(true);
    });

    // then
    it('should be finished if CACHETOKENISE', () => {
      expect(isTransactionFinishedFixture({ requesttypedescription: 'CACHETOKENISE' })).toEqual(true);
    });

    // then
    it('should be finished if _isThreedComplete is true', () => {
      // @ts-ignore
      instance._isThreedComplete = jest.fn().mockReturnValueOnce(true);
      expect(isTransactionFinishedFixture({ requesttypedescription: 'THREEDQUERY' })).toEqual(true);
    });

    // then
    it('should not be finished if _isThreedComplete is false', () => {
      // @ts-ignore
      instance._isThreedComplete = jest.fn().mockReturnValueOnce(false);
      expect(isTransactionFinishedFixture({ requesttypedescription: 'THREEDQUERY' })).toEqual(false);
    });
  });

  describe('_getSubmitFields()', () => {
    // when
    const { instance } = commonFramesFixture();

    function getSubmitFieldsFixture(dataArg: {}, submitFields: string[]) {
      const data = { ...dataArg };
      // @ts-ignore
      instance._submitFields = [...submitFields];
      // @ts-ignore
      return instance._getSubmitFields(data);
    }

    // then
    it('should return submit fields', () => {
      expect(getSubmitFieldsFixture({ something: 'a value' }, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
    // then
    it('should return submit fields plus jwt', () => {
      expect(
        getSubmitFieldsFixture(
          {
            something: 'a value',
            jwt: 'a value'
          },
          ['a', 'b', 'c']
        )
      ).toEqual(['a', 'b', 'c', 'jwt']);
    });
    // then
    it('should return submit fields plus jwt and threedresponse', () => {
      expect(
        getSubmitFieldsFixture(
          {
            something: 'a value',
            jwt: 'a value',
            threedresponse: 'acs response'
          },
          ['a', 'b', 'c']
        )
      ).toEqual(['a', 'b', 'c', 'jwt', 'threedresponse']);
    });
  });
  // given
  describe('_onInput()', () => {
    const { instance } = commonFramesFixture();
    const event = new Event('input');
    const messageBusEvent = {
      data: {},
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      // @ts-ignore
      instance._onInput(event);
    });

    // then
    it('should publish has been called', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  // given
  describe('_setTransactionCompleteListener()', () => {
    const { instance } = commonFramesFixture();
    const data = {
      errorcode: '0',
      errormessage: 'Ok'
    };
    const messageBus: MessageBus = (new MessageBusMock() as unknown) as MessageBus;

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._messageBus = messageBus;
      // @ts-ignore
      instance._onTransactionComplete = jest.fn();
    });

    // then
    it('should call _merchantForm() method', () => {
      // @ts-ignore
      instance._setTransactionCompleteListener();

      messageBus.publish({ type: PUBLIC_EVENTS.TRANSACTION_COMPLETE, data });

      // @ts-ignore
      expect(instance._onTransactionComplete).toHaveBeenCalled();
    });
  });
});

function commonFramesFixture() {
  document.body.innerHTML =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  const jwt: string =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU2MDk0NjM4Ny4yNDIzMzQ0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMCIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.UssdRcocpaeAqd-jDXpxWeWiKIX-W7zlpy0UWrDE5vg';
  const origin: string = 'https://example.com';
  const componentsIds = {
    animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
    cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
    expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
    securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
  };
  const animatedCard = true;
  const gatewayUrl: string = 'https://webservices.securetrading.net/jwt/';
  const instance = new CommonFrames(
    jwt,
    origin,
    componentsIds,
    {},
    false,
    false,
    false,
    [],
    gatewayUrl,
    animatedCard,
    ['AUTH'],
    'st-form'
  );

  return { instance };
}

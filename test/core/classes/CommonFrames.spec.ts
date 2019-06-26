import CommonFrames from '../../../src/core/classes/CommonFrames.class';
import Selectors from '../../../src/core/shared/Selectors';

// given
describe('CommonFrames', () => {
  // given
  describe('_isThreedComplete()', () => {
    // when
    const { instance } = commonFramesFixture();

    // then
    it('should be complete', () => {
      // @ts-ignore
      instance._requestTypes = ['THREEDQUERY'];
      const data = { requesttypedescription: 'THREEDQUERY' };
      // @ts-ignore
      const result = instance._isThreedComplete(data);
      expect(result).toEqual(true);
    });
    // then
    it('should not be complete if not a THREEDQUERY', () => {
      // @ts-ignore
      instance._requestTypes = ['THREEDQUERY'];
      const data = { requesttypedescription: 'RISKDEC' };
      // @ts-ignore
      const result = instance._isThreedComplete(data);
      expect(result).toEqual(false);
    });
    // then
    it('should not be complete if THREEDQUERY not last request type', () => {
      // @ts-ignore
      instance._requestTypes = ['THREEDQUERY', 'AUTH'];
      const data = { requesttypedescription: 'THREEDQUERY' };
      // @ts-ignore
      const result = instance._isThreedComplete(data);
      expect(result).toEqual(false);
    });
    // then
    it('should not be complete if THREEDQUERY but enrolled and non-frictionless', () => {
      // @ts-ignore
      instance._requestTypes = ['THREEDQUERY'];
      const data = { acsurl: 'https://example.com', enrolled: 'Y', requesttypedescription: 'THREEDQUERY' };
      // @ts-ignore
      const result = instance._isThreedComplete(data);
      expect(result).toEqual(false);
    });
    // then
    it('should not be complete if THREEDQUERY but enrolled unless threedresponse is available', () => {
      // @ts-ignore
      instance._requestTypes = ['THREEDQUERY'];
      const data = {
        acsurl: 'https://example.com',
        enrolled: 'Y',
        requesttypedescription: 'THREEDQUERY',
        threedresponse: 'somedata'
      };
      // @ts-ignore
      const result = instance._isThreedComplete(data);
      expect(result).toEqual(true);
    });
  });

  describe('_isTransactionFinished()', () => {
    // when
    const { instance } = commonFramesFixture();

    // then
    it('should be finished if AUTH', () => {
      const data = { requesttypedescription: 'AUTH' };
      // @ts-ignore
      const result = instance._isTransactionFinished(data);
      expect(result).toEqual(true);
    });
    // then
    it('should be finished if CACHETOKEN', () => {
      const data = { requesttypedescription: 'AUTH' };
      // @ts-ignore
      const result = instance._isTransactionFinished(data);
      expect(result).toEqual(true);
    });
    // then
    it('should be finished if _isThreedComplete is true', () => {
      const data = { requesttypedescription: 'THREEDQUERY' };
      // @ts-ignore
      instance._isThreedComplete = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      const result = instance._isTransactionFinished(data);
      expect(result).toEqual(true);
    });
    // then
    it('should not be finished if _isThreedComplete is false', () => {
      const data = { requesttypedescription: 'THREEDQUERY' };
      // @ts-ignore
      instance._isThreedComplete = jest.fn().mockReturnValueOnce(false);
      // @ts-ignore
      const result = instance._isTransactionFinished(data);
      expect(result).toEqual(false);
    });
  });

  describe('_shouldSubmitForm()', () => {
    // when
    const { instance } = commonFramesFixture();

    // then
    it('should submit if submit on success true', () => {
      const data = { errorcode: '0' };
      // @ts-ignore
      instance._isTransactionFinished = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance.submitOnSuccess = true;
      // @ts-ignore
      instance.submitOnError = false;
      // @ts-ignore
      const result = instance._shouldSubmitForm(data);
      expect(result).toEqual(true);
    });
    // then
    it('should not submit if submit on success false', () => {
      const data = { errorcode: '0' };
      // @ts-ignore
      instance._isTransactionFinished = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance.submitOnSuccess = false;
      // @ts-ignore
      instance.submitOnError = true;
      // @ts-ignore
      const result = instance._shouldSubmitForm(data);
      expect(result).toEqual(false);
    });
    // then
    it('should not submit if transaction finished is false', () => {
      const data = { errorcode: '0' };
      // @ts-ignore
      instance._isTransactionFinished = jest.fn().mockReturnValueOnce(false);
      // @ts-ignore
      instance.submitOnSuccess = true;
      // @ts-ignore
      instance.submitOnError = false;
      // @ts-ignore
      const result = instance._shouldSubmitForm(data);
      expect(result).toEqual(false);
    });
    // then
    it('should not submit if errorcode is not 0 and submit on error is false', () => {
      const data = { errorcode: '30000' };
      // @ts-ignore
      instance._isTransactionFinished = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance.submitOnSuccess = true;
      // @ts-ignore
      instance.submitOnError = false;
      // @ts-ignore
      const result = instance._shouldSubmitForm(data);
      expect(result).toEqual(false);
    });
    // then
    it('should submit if errorcode is not 0 but submit on error is true', () => {
      const data = { errorcode: '30000' };
      // @ts-ignore
      instance._isTransactionFinished = jest.fn().mockReturnValueOnce(true);
      // @ts-ignore
      instance.submitOnSuccess = true;
      // @ts-ignore
      instance.submitOnError = true;
      // @ts-ignore
      const result = instance._shouldSubmitForm(data);
      expect(result).toEqual(true);
    });
  });

  describe('getSubmitFields()', () => {
    // when
    const { instance } = commonFramesFixture();

    // then
    it('should return submit fields', () => {
      const data = { something: 'a value' };
      // @ts-ignore
      instance.submitFields = ['a', 'b', 'c'];
      // @ts-ignore
      const result = instance.getSubmitFields(data);
      expect(result).toEqual(['a', 'b', 'c']);
    });
    // then
    it('should return submit fields plus jwt', () => {
      const data = { something: 'a value', jwt: 'a value' };
      // @ts-ignore
      instance.submitFields = ['a', 'b', 'c'];
      // @ts-ignore
      const result = instance.getSubmitFields(data);
      expect(result).toEqual(['a', 'b', 'c', 'jwt']);
    });
    // then
    it('should return submit fields plus jwt and threedresponse', () => {
      const data = { something: 'a value', jwt: 'a value', threedresponse: 'acs response' };
      // @ts-ignore
      instance.submitFields = ['a', 'b', 'c'];
      // @ts-ignore
      const result = instance.getSubmitFields(data);
      expect(result).toEqual(['a', 'b', 'c', 'jwt', 'threedresponse']);
    });
  });
});

function commonFramesFixture() {
  const html =
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number" class="example-form__group"></div> <div id="st-expiration-date" class="example-form__group"></div> <div id="st-security-code" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  document.body.innerHTML = html;

  const jwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU2MDk0NjM4Ny4yNDIzMzQ0LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMCIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.UssdRcocpaeAqd-jDXpxWeWiKIX-W7zlpy0UWrDE5vg';

  const instance = new CommonFrames(
    jwt,
    'https://example.com',
    {
      animatedCard: Selectors.ANIMATED_CARD_INPUT_SELECTOR,
      cardNumber: Selectors.CARD_NUMBER_INPUT_SELECTOR,
      expirationDate: Selectors.EXPIRATION_DATE_INPUT_SELECTOR,
      notificationFrame: Selectors.NOTIFICATION_FRAME_ID,
      securityCode: Selectors.SECURITY_CODE_INPUT_SELECTOR
    },
    {},
    false,
    false,
    [],
    'https://webservices.securetrading.net/jwt/'
  );
  return { instance };
}

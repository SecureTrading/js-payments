import CardFrames from '../../../src/core/classes/CardFrames.class';

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
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
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
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
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
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
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
    // when
    beforeEach(() => {});

    // then
    it('', () => {});
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
    '<form id="st-form" class="example-form"> <h1 class="example-form__title"> Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span> </h1> <div class="example-form__section example-form__section--horizontal"> <div class="example-form__group"> <label for="example-form-name" class="example-form__label example-form__label--required">NAME</label> <input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" /> </div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /> </div> </div> <div class="example-form__spacer"></div> <div class="example-form__section"> <div id="st-notification-frame" class="example-form__group"></div> <div id="st-card-number-iframe" class="example-form__group"></div> <div id="st-expiration-date-iframe" class="example-form__group"></div> <div id="st-security-code-iframe" class="example-form__group"></div> <div id="st-error-container" class="example-form__group"></div> <div class="example-form__spacer"></div> </div> <div class="example-form__section"> <div class="example-form__group"> <button type="submit" class="example-form__button">PAY</button> </div> </div> <div class="example-form__section"> <div id="st-control-frame" class="example-form__group"></div> <div id="st-visa-checkout" class="example-form__group"></div> <div id="st-apple-pay" class="example-form__group"></div> </div> <div id="st-animated-card" class="st-animated-card-wrapper"></div> </form>';
  document.body.innerHTML = html;
  const instance = new CardFrames(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTYyODU0NjQ3LjgyNTUyMTIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJsb2NhbGUiOiJlbl9HQiJ9fQ.vqCAI0quQ2oShuirr6iRGNgVfv2YsR_v3Q9smhVx5PM',
    'localhost',
    {},
    {},
    ['VISA,MASTERCARD,AMEX'],
    'AMEX'
  );
  return { instance };
}

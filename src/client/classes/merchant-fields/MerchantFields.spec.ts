import { MerchantFields } from './MerchantFields';

jest.mock('./../../../../src/application/core/shared/notification/Notification');

// given
describe('MerchantField', () => {
  // given
  describe('init()', () => {
    // when
    const { instance } = merchantFieldsFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._onKeyPress = jest.fn();
      instance.init();
    });

    // then
    it('should call _onKeyPress', () => {
      // @ts-ignore
      expect(instance._onKeyPress).toHaveBeenCalled();
    });

    // then
    it('should return collection of merchant inputs', () => {
      const firstName = document.getElementById('example-form-name');
      const email = document.getElementById('example-form-email');
      // @ts-ignore
      expect(instance._getMerchantInputs()).toEqual({
        inputs: [firstName, email]
      });
    });
  });
});

function merchantFieldsFixture() {
  document.body.innerHTML =
    '<div class="example-form__section example-form__section--horizontal"><div class="example-form__group"><label for="example-form-name" class="example-form__label">NAME</label><input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" name="myBillName" data-st-name="billingfirstname"></div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" name="myBillEmail" data-st-name="billingemail"> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" name="myBillTel"></div></div>';
  const instance = new MerchantFields();
  const receivedMerchantFieldsArray = { merchantFieldsNamesArray: ['billingfirstname', 'billingemail'] };
  return { instance, receivedMerchantFieldsArray };
}

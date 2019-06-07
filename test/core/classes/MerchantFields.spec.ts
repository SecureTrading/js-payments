// given
import { MerchantFields } from '../../../src/core/classes/MerchantFields';

describe('MerchantField', () => {
  // given
  describe('findAllMerchantInputs()', () => {
    // when
    const { receivedMerchantFieldsArray, instance } = merchantFieldsFixture();

    // then
    it('should return an array with fields names', () => {
      expect(instance.findAllMerchantInputs()).toEqual(receivedMerchantFieldsArray);
    });
  });
});

function merchantFieldsFixture() {
  const html =
    '<div class="example-form__section example-form__section--horizontal"><div class="example-form__group"><label for="example-form-name" class="example-form__label">NAME</label><input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" name="myBillName" data-st-name="billingfirstname"></div> <div class="example-form__group"> <label for="example-form-email" class="example-form__label">E-MAIL</label> <input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" name="myBillEmail" data-st-name="billingemail"> </div> <div class="example-form__group"> <label for="example-form-phone" class="example-form__label">PHONE</label> <input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" name="myBillTel"></div></div>';
  document.body.innerHTML = html;
  const instance = new MerchantFields();
  const receivedMerchantFieldsArray = { merchantFieldsNamesArray: ['billingfirstname', 'billingemail'] };
  return { instance, receivedMerchantFieldsArray };
}

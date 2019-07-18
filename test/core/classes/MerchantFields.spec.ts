import { MerchantFields } from '../../../src/core/classes/MerchantFields';
import MessageBus from '../../../src/core/shared/MessageBus';

// given
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

  // given
  describe('backendValidation()', () => {
    const { instance } = merchantFieldsFixture();
    const element = document.createElement('input');
    const data = {
      field: 'some field',
      message: 'some message'
    };

    // then
    it('should subscribe listener has been called', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn();
      // @ts-ignore
      instance._validation.checkBackendValidity = jest.fn();
      // @ts-ignore
      instance._validation.validate = jest.fn();
      // @ts-ignore
      instance._backendValidation(element, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD);
      // @ts-ignore
      expect(instance._messageBus.subscribe).toHaveBeenCalled();
    });

    // then
    it('should checkBackendValidity and validate methods has been called', () => {
      // @ts-ignore
      instance._messageBus.subscribe = jest.fn().mockImplementationOnce((event, callback) => {
        callback(data);
      });

      // @ts-ignore
      instance._backendValidation(element, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD);
      // @ts-ignore
      expect(instance._validation.checkBackendValidity).toHaveBeenCalled();
      // @ts-ignore
      expect(instance._validation.validate).toHaveBeenCalled();
    });
  });

  // given
  describe('_addKeypressListener()', () => {
    const { instance } = merchantFieldsFixture();
    const element = document.createElement('input');

    // when
    beforeEach(() => {
      element.addEventListener = jest.fn();
      element.setCustomValidity = jest.fn();
      element.classList.remove = jest.fn();
    });
    // then
    it('should call addEventListener', () => {
      // @ts-ignore
      instance._addKeypressListener(element);
      expect(element.addEventListener).toHaveBeenCalled();
    });

    // then
    it('should call setCustomValidity and classList.remove', () => {
      element.addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance._addKeypressListener(element);
      expect(element.setCustomValidity).toHaveBeenCalled();
      expect(element.classList.remove).toHaveBeenCalled();
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

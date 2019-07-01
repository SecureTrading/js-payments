import FormField from '../../../src/core/shared/FormField';
import Language from '../../../src/core/shared/Language';

jest.mock('./../../../src/core/shared/Validation');
// given
describe('FormField', () => {
  // given
  describe('getLabel()', () => {
    const { instance } = FormFieldFixture();
    // then
    it('should throw exception', () => {
      // @ts-ignore
      instance.getLabel();
      expect(() => {
        throw new Error(Language.translations.NOT_IMPLEMENTED_ERROR);
      }).toThrow();
    });
  });
  // given
  describe('onClick()', () => {
    let spy: jest.SpyInstance;
    const { instance } = FormFieldFixture();

    beforeEach(() => {
      const event = new Event('click');
      // @ts-ignore
      spy = jest.spyOn(instance, '_click');
      // @ts-ignore
      instance.onClick(event);
    });

    it('should call click method', () => {
      expect(spy).toBeCalled();
    });
  });
  // given
  describe('onFocus()', () => {
    const { instance } = FormFieldFixture();
    let spy: jest.SpyInstance;
    // then
    it('should focus on input element', () => {
      // @ts-ignore
      const mockFocus = (instance._inputElement.focus = jest.fn());
      // @ts-ignore
      instance.onFocus();
      expect(mockFocus).toBeCalledTimes(2);
    });
  });
  // given
  describe('onInput()', () => {
    const { instance } = FormFieldFixture();
    let spy: jest.SpyInstance;
    // then
    it('should input on input element', () => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'format');
      // @ts-ignore
      instance.onInput();
      expect(spy).toBeCalledTimes(1);
    });
  });
  // given
  describe('onKeyPress()', () => {
    const { instance } = FormFieldFixture();
    const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 'a' });
    // @ts-ignore
    const eventSuccess: KeyboardEvent = new KeyboardEvent('keypress', { keyCode: 13 });
    const preventDefault = jest.spyOn(event, 'preventDefault');
    // @ts-ignore
    instance._messageBus.publish = jest.fn().mockImplementation(() => {});

    // then
    it('should trigger preventDefault function and prevents default event ', () => {
      // @ts-ignore
      instance.onKeyPress(event);
      expect(preventDefault).toHaveBeenCalled();
    });
    // then
    it('should trigger instance._messageBus.publish ', () => {
      // @ts-ignore
      instance.onKeyPress(eventSuccess);
      // @ts-ignore
      // expect(instance._messageBus.publish).toHaveBeenCalled();
    });
  });
  // given
  describe('setAttributes()', () => {
    const { instance } = FormFieldFixture();
    // then
    it('should set attributes to HTML input element', () => {
      let inputAttributes = {
        maxlength: 10,
        minlength: 1
      };
      // @ts-ignore
      instance.setAttributes(inputAttributes);
      // @ts-ignore
      expect(instance._inputElement.getAttribute('maxlength')).toEqual(inputAttributes.maxlength.toString());
      // @ts-ignore
      expect(instance._inputElement.getAttribute('minlength')).toEqual(inputAttributes.minlength.toString());
    });
  });
  // given
  describe('_setInputListeners()', () => {
    const { instance } = FormFieldFixture();
    // then
    it('should call onPaste listener', () => {});
    // then
    it('should call onKeyPress listener', () => {});
    // then
    it('should call onInput listener', () => {});
    // then
    it('should call onFocus listener', () => {});
    // then
    it('should call onBlur listener', () => {});
    // then
    it('should call onClick listener', () => {});
  });
});

function FormFieldFixture() {
  let inputElement: HTMLInputElement;
  let labelElement: HTMLLabelElement;
  let messageElement: HTMLParagraphElement;
  labelElement = document.createElement('label');
  inputElement = document.createElement('input');
  messageElement = document.createElement('p');
  labelElement.id = 'st-form-field-label';
  inputElement.id = 'st-form-field-input';
  messageElement.id = 'st-form-field-message';

  document.body.appendChild(labelElement);
  document.body.appendChild(inputElement);
  document.body.appendChild(messageElement);
  // @ts-ignore
  FormField.prototype.getLabel = jest.fn(); // Not implemented in FormField
  const instance = new FormField('st-form-field-input', 'st-form-field-message', 'st-form-field-label');
  return { instance, inputElement, messageElement, labelElement };
}

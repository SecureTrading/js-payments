import FormField from '../../../src/core/shared/FormField';
import Language from '../../../src/core/shared/Language';
import Validation from '../../../src/core/shared/Validation';

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
  describe('onKeyPress()', () => {
    let spy: jest.SpyInstance;
    const { instance } = FormFieldFixture();
    const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 'a' });
    const preventDefault = jest.spyOn(event, 'preventDefault');

    beforeEach(() => {
      // @ts-ignore
      instance.onKeyPress(event);
    });

    // then
    it('should trigger isMaxLengthReached function and prevents default event ', () => {
      expect(preventDefault).toHaveBeenCalled();
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
  describe('onFocus()', () => {
    const { instance } = FormFieldFixture();
    // then
    it('should focus on input element', () => {
      // @ts-ignore
      const mockFocus = (instance._inputElement.focus = jest.fn());
      // @ts-ignore
      instance.onFocus();
      expect(mockFocus).toBeCalledTimes(2);
      expect(mockFocus).toBeCalledWith();
    });
  });
  // given
  describe('_addTabListener()', () => {
    const { instance } = FormFieldFixture();
    // then
    it('should add focus event listener', () => {
      window.addEventListener = jest.fn();
      // @ts-ignore
      instance._addTabListener();

      expect(window.addEventListener).toBeCalledTimes(1);
      // @ts-ignore
      const calls = window.addEventListener.mock.calls;
      expect(calls[0].length).toBe(2);
      expect(calls[0][0]).toBe('focus');
      expect(calls[0][1]).toBeInstanceOf(Function);
    });
  });
  // given
  describe('_setInputListeners()', () => {
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

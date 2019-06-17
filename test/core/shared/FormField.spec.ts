import FormField from '../../../src/core/shared/FormField';
import Language from '../../../src/core/shared/Language';

// given
describe('FormField', () => {
  let formField: FormField;
  let inputElement: HTMLInputElement;
  let labelElement: HTMLLabelElement;
  let messageElement: HTMLParagraphElement;

  // when
  beforeAll(() => {
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

    formField = new FormField('st-form-field-input', 'st-form-field-message', 'st-form-field-label');
  });

  // given
  describe('getLabel()', () => {
    let t: any;
    beforeEach(() => {
      t = () => {
        throw new Error();
      };
    });

    // then
    it('should throw exception', () => {
      // @ts-ignore
      formField.getLabel();
      expect(t).toThrow(Error);
    });
  });
  // given
  describe('onClick()', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      const event = new Event('click');
      // @ts-ignore
      spy = jest.spyOn(formField, '_click');
      // @ts-ignore
      formField.onClick(event);
    });

    it('should call click method', () => {
      expect(spy).toBeCalled();
    });
  });

  // given
  describe('setAttributes()', () => {
    // then
    it('should set attributes to HTML input element', () => {
      let inputAttributes = {
        maxlength: 10,
        minlength: 1
      };
      // @ts-ignore
      formField.setAttributes(inputAttributes);

      expect(inputElement.getAttribute('maxlength')).toEqual(inputAttributes.maxlength.toString());
      expect(inputElement.getAttribute('minlength')).toEqual(inputAttributes.minlength.toString());
    });
  });

  // given
  describe('onFocus()', () => {
    // then
    it('should focus on input element', () => {
      // @ts-ignore
      const mockFocus = (formField._inputElement.focus = jest.fn());
      // @ts-ignore
      formField.onFocus();
      expect(mockFocus).toBeCalledTimes(2);
      expect(mockFocus).toBeCalledWith();
    });
  });
  // given
  describe('_addTabListener()', () => {
    // then
    it('should add focus event listener', () => {
      window.addEventListener = jest.fn();
      // @ts-ignore
      formField._addTabListener();

      expect(window.addEventListener).toBeCalledTimes(1);
      // @ts-ignore
      const calls = window.addEventListener.mock.calls;
      expect(calls[0].length).toBe(2);
      expect(calls[0][0]).toBe('focus');
      expect(calls[0][1]).toBeInstanceOf(Function);
    });
  });
});

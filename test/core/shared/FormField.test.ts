import FormField from '../../../src/core/shared/FormField';

describe('FormField', () => {
  let formField: FormField;
  let inputElement: HTMLInputElement;
  let labelElement: HTMLLabelElement;
  let messageElement: HTMLParagraphElement;

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

    formField = new FormField('st-form-field-input', 'st-form-field-message', 'st-form-field-label');
  });

  describe('setAttributes()', () => {
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

  describe('setMessage()', () => {
    it('should render given message', () => {
      let message: string = 'abc';
      // @ts-ignore
      formField.setMessage(message);

      expect(messageElement.innerText).toBe(message);
    });
  });

  describe('setValue()', () => {
    it('should set value of input element', () => {
      let value: string = '123';
      // @ts-ignore
      formField.setValue(value);

      expect(inputElement.value).toBe(value);
    });
  });
});

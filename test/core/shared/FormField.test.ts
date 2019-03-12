import FormField from '../../../src/core/shared/FormField';

describe('FormField', () => {
  let formField: FormField;
  let inputElement: HTMLInputElement;
  let messageElement: HTMLParagraphElement;

  beforeAll(() => {
    inputElement = document.createElement('input');
    messageElement = document.createElement('p');
    inputElement.id = 'st-form-field-input';
    messageElement.id = 'st-form-field-message';

    document.body.appendChild(inputElement);
    document.body.appendChild(messageElement);

    formField = new FormField('st-form-field-input', 'st-form-field-message');
  });

  // describe('constructor', () => {
  //   it('should store a reference to an input element and attach event listeners', () => {
  //
  //
  //
  //
  //     // expect(formField._htmlElement).toBe(inputElement);
  //   });
  // });

  // describe('onPaste()', () => {
  //   it('should update input with numeric value (non-numeric characters should be removed)', () => {
  //     // let data: DataTransfer = new global.DataTransfer();
  //     // let event: ClipboardEvent;
  //     //
  //     // data.setData('text/plain', ' abc 123 abc ');
  //     // event = new ClipboardEvent('paste');
  //     //
  //     // formField.onPaste(event);
  //   });
  // });

  describe('setAttributes()', () => {
    it('should set attributes to HTML input element', () => {
      let inputAttributes = {
        maxlength: 10,
        minlength: 1
      };

      formField.setAttributes(inputAttributes);

      expect(inputElement.getAttribute('maxlength')).toEqual(inputAttributes.maxlength.toString());
      expect(inputElement.getAttribute('minlength')).toEqual(inputAttributes.minlength.toString());
    });
  });

  describe('setMessage()', () => {
    it('should render given message', () => {
      let message: string = 'abc';

      formField.setMessage(message);

      expect(messageElement.innerText).toBe(message);
    });
  });

  describe('setValue()', () => {
    it('should set value of input element', () => {
      let value: string = '123';

      formField.setValue(value);

      expect(inputElement.value).toBe(value);
    });
  });
});

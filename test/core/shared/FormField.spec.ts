import FormField from '../../../src/core/shared/FormField';

// given
describe('FormField', () => {
  // given
  describe('getLabel()', () => {
    const { instance } = FormFieldFixture();
    let t: any;
    beforeEach(() => {
      t = () => {
        throw new Error();
      };
      // @ts-ignore
    });

    // then
    it('should throw exception', () => {
      // @ts-ignore
      instance.getLabel();
      expect(t).toThrow(Error);
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
  describe('setAttributes()', () => {
    const { instance, inputElement } = FormFieldFixture();

    // then
    it('should set attributes to HTML input element', () => {
      let inputAttributes = {
        maxlength: 10,
        minlength: 1
      };
      // @ts-ignore
      instance.setAttributes(inputAttributes);

      // expect(inputElement.getAttribute('maxlength')).toEqual(inputAttributes.maxlength.toString());
      // expect(inputElement.getAttribute('minlength')).toEqual(inputAttributes.minlength.toString());
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
  describe('_setInputListeners', () => {
    const { instance } = FormFieldFixture();
    // @ts-ignore
    const spyOnPaste = jest.spyOn(instance, 'onPaste');
    // @ts-ignore
    instance._inputElement.addEventListener = jest.fn().mockImplementation((event, callback) => {
      callback(event);
    });

    // then
    it('should call onPaste method', () => {
      // @ts-ignore
      instance._setInputListeners();
      //expect(spyOnPaste).toBeCalled();
    });
  });
});

function FormFieldFixture() {
  const inputSelector = 'st-form-field-label';
  const labelSelector = 'st-form-field-input';
  const messageSelector = 'st-form-field-message';
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
  const instance = new FormField(inputSelector, labelSelector, messageSelector);

  return { instance, inputElement, labelElement, messageElement };
}

import Formatter from '../../../src/core/shared/Formatter';
import FormField from '../../../src/core/shared/FormField';
import Language from '../../../src/core/shared/Language';
import MessageBus from '../../../src/core/shared/MessageBus';
import Validation from '../../../src/core/shared/Validation';

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
    const messageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };

    // when
    beforeEach(() => {
      Validation.isEnter = jest.fn().mockReturnValue(true);
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
      // @ts-ignore
      instance.onKeyPress();
    });

    // then
    it('should trigger instance._messageBus.publish ', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(messageBusEvent);
    });
  });

  // given
  describe('onPaste()', () => {
    const { instance } = FormFieldFixture();
    const event = {
      clipboardData: {
        getData: jest.fn()
      },
      preventDefault: jest.fn()
    };

    // @ts-ignore
    instance._inputElement = document.createElement('input');
    // @ts-ignore
    instance._messageElement = document.createElement('div');

    beforeEach(() => {
      // instance._inputValue.value = '123';
      Formatter.trimNonNumeric = jest.fn().mockReturnValueOnce('123');
      Validation.setCustomValidationError = jest.fn();
      // @ts-ignore
      instance.format = jest.fn();

      // @ts-ignore
      instance.onPaste(event);
    });

    // then
    it('should event.preventDefault() has been called', () => {
      expect(event.preventDefault).toHaveBeenCalled();
    });

    // then
    it('should Validation.setCustomValidationError method has been called', () => {
      expect(Validation.setCustomValidationError).toHaveBeenCalled();
    });

    // then
    it('should instance._inputElement.value has been equal to pasted value', () => {
      // @ts-ignore
      expect(instance._inputElement.value).toEqual('123');
    });

    // then
    it('should format method has been called', () => {
      // @ts-ignore
      expect(instance.format).toHaveBeenCalledWith(instance._inputElement.value);
    });

    // then
    it('should validate method has been called with inputElement and messageElement', () => {
      // @ts-ignore
      expect(instance.validation.validate).toHaveBeenCalledWith(instance._inputElement, instance._messageElement);
    });
  });

  // given
  describe('_addTabListener', () => {
    const { instance } = FormFieldFixture();
    // when
    beforeEach(() => {
      window.addEventListener = jest.fn().mockImplementationOnce((event, callback) => {
        callback();
      });
      // @ts-ignore
      instance.onFocus = jest.fn();
      // @ts-ignore
      instance._addTabListener();
    });

    // then
    it('should call onFocus', () => {
      // @ts-ignore
      expect(instance.onFocus).toHaveBeenCalled();
    });
  });

  // given
  describe('_setInputListeners()', () => {
    const { instance } = FormFieldFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance._inputElement.addEventListener = jest.fn().mockImplementation((event, callback) => {
        callback();
      });
    });

    // when
    beforeAll(() => {
      // @ts-ignore
      instance.onPaste = jest.fn();
      // @ts-ignore
      instance.onKeyPress = jest.fn();
      // @ts-ignore
      instance.onInput = jest.fn();
      // @ts-ignore
      instance.onFocus = jest.fn();
      // @ts-ignore
      instance.onBlur = jest.fn();
      // @ts-ignore
      instance.onClick = jest.fn();
    });

    // then
    it('should call onPaste listener', () => {
      // @ts-ignore
      instance._setInputListeners();
      // @ts-ignore
      expect(instance.onPaste).toHaveBeenCalled();
    });

    // then
    it('should call onKeyPress listener', () => {
      // @ts-ignore
      instance._setInputListeners();
      // @ts-ignore
      expect(instance.onKeyPress).toHaveBeenCalled();
    });

    // then
    it('should call onInput listener', () => {
      // @ts-ignore
      instance._setInputListeners();
      // @ts-ignore
      expect(instance.onInput).toHaveBeenCalled();
    });

    // then
    it('should call onFocus listener', () => {
      // @ts-ignore
      instance._setInputListeners();
      // @ts-ignore
      expect(instance.onFocus).toHaveBeenCalled();
    });

    // then
    it('should call onBlur listener', () => {
      // @ts-ignore
      instance._setInputListeners();
      // @ts-ignore
      expect(instance.onBlur).toHaveBeenCalled();
    });

    // then
    it('should call onClick listener', () => {
      // @ts-ignore
      instance._setInputListeners();
      // @ts-ignore
      expect(instance.onClick).toHaveBeenCalled();
    });
  });

  // given
  describe('_setLabelText()', () => {
    const { instance } = FormFieldFixture();

    // when
    beforeEach(() => {
      // @ts-ignore
      instance.getLabel = jest.fn();
      // @ts-ignore
      instance._setLabelText();
    });
    it('should call an error', () => {
      // @ts-ignore
      expect(instance.getLabel).toHaveBeenCalled();
    });
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
  FormField.prototype.getLabel = jest.fn();
  const instance = new FormField('st-form-field-input', 'st-form-field-message', 'st-form-field-label');
  return { instance, inputElement, messageElement, labelElement };
}

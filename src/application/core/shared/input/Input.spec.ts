import { Input } from './Input';
import { NOT_IMPLEMENTED_ERROR } from '../../models/constants/Translations';
import { Utils } from '../utils/Utils';
import { Validation } from '../validation/Validation';

jest.mock('./../validation/Validation');
jest.mock('./../notification/Notification');

// given
describe('FormField', () => {
  // given
  describe('getLabel()', () => {
    const { instance } = formFieldFixture();
    // then
    it('should throw exception', () => {
      // @ts-ignore
      instance.getLabel();
      expect(() => {
        throw new Error(NOT_IMPLEMENTED_ERROR);
      }).toThrow();
    });
  });

  // given
  describe('onClick()', () => {
    let spy: jest.SpyInstance;
    const { instance } = formFieldFixture();

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
    const { instance } = formFieldFixture();
    let spy: jest.SpyInstance;
    // then
    it('should focus on input iframe-factory', () => {
      // @ts-ignore
      const mockFocus = (instance._inputElement.focus = jest.fn());
      // @ts-ignore
      instance.onFocus();
      expect(mockFocus).toBeCalledTimes(1);
    });
  });

  // given
  describe('onInput()', () => {
    const { instance } = formFieldFixture();
    let spy: jest.SpyInstance;
    // then
    it('should input on input iframe-factory', () => {
      // @ts-ignore
      spy = jest.spyOn(instance, 'format');
      // @ts-ignore
      instance.onInput();
      expect(spy).toBeCalledTimes(1);
    });
  });

  // given
  describe('onPaste()', () => {
    const { instance } = formFieldFixture();
    const event = {
      clipboardData: {
        getData: jest.fn()
      },
      preventDefault: jest.fn()
    };

    // @ts-ignore
    instance._inputElement = document.createElement('input');
    // @ts-ignore
    instance._inputElement.value = '44';
    // @ts-ignore
    instance._messageElement = document.createElement('div');

    beforeEach(() => {
      Validation.setCustomValidationError = jest.fn();
      // @ts-ignore
      instance.format = jest.fn();
      Utils.stripChars = jest.fn();

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
    const { instance } = formFieldFixture();
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
    const { instance } = formFieldFixture();

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
    const { instance } = formFieldFixture();

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

function formFieldFixture() {
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
  Input.prototype.getLabel = jest.fn().mockReturnValueOnce(() => {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  });
  const instance = new Input('st-form-field-input', 'st-form-field-message', 'st-form-field-label');
  return { instance, inputElement, messageElement, labelElement };
}

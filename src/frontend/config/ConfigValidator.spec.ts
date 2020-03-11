import { ConfigValidator } from './ConfigValidator';
import { IConfig } from '../../shared/model/config/IConfig';
import Joi, { ValidationError } from 'joi';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;
  const config: IConfig = ({} as unknown) as IConfig;
  const joiMock: jest.Mocked<typeof Joi> = Joi as any;

  beforeEach(() => {
    validator = new ConfigValidator();
    joiMock.validate = jest.fn();
  });

  it('returns validation error if validation fails', () => {
    const error: ValidationError = ({ foo: 'bar' } as unknown) as ValidationError;

    joiMock.validate.mockReturnValue({
      error,
      value: config
    });

    expect(validator.validate(config)).toBe(error);
  });

  it('returns null when validation suceeds', () => {
    joiMock.validate.mockReturnValue({
      error: undefined,
      value: config
    });

    expect(validator.validate(config)).toBeNull();
  });
});

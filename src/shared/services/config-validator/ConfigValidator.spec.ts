import { ConfigValidator } from './ConfigValidator';
import { IConfig } from '../../model/config/IConfig';
import { ValidationError } from 'joi';
import { ConfigSchema } from '../storage/ConfigSchema';

jest.mock('./../storage/ConfigSchema');

describe('ConfigValidator', () => {
  let validator: ConfigValidator;
  const config: IConfig = ({} as unknown) as IConfig;

  beforeEach(() => {
    validator = new ConfigValidator();
    ConfigSchema.validate = jest.fn();
  });

  it('returns validation error if validation fails', () => {
    const error: ValidationError = ({ foo: 'bar' } as unknown) as ValidationError;

    (ConfigSchema.validate as jest.Mock).mockReturnValue({
      error,
      value: config
    });

    expect(validator.validate(config)).toBe(error);
  });

  it('returns null when validation suceeds', () => {
    (ConfigSchema.validate as jest.Mock).mockReturnValue({
      error: undefined,
      value: config
    });

    expect(validator.validate(config)).toBeNull();
  });
});

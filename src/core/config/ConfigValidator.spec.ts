import { ConfigValidator } from './ConfigValidator';
import { IConfig } from './model/IConfig';
import { ValidationError } from '@hapi/joi';
import { ConfigSchema } from './schema/ConfigSchema';

jest.mock('./schema/ConfigSchema');

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

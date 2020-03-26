import { Service } from 'typedi';
import { IConfig } from './model/IConfig';
import { ValidationError } from '@hapi/joi';
import { ConfigSchema } from './schema/ConfigSchema';

@Service()
export class ConfigValidator {
  validate(config: IConfig): ValidationError | null {
    return ConfigSchema.validate(config).error || null;
  }
}

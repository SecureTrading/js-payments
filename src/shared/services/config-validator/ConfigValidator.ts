import { Service } from 'typedi';
import { IConfig } from '../../model/config/IConfig';
import { ValidationError } from '@hapi/joi';
import { ConfigSchema } from '../storage/ConfigSchema';

@Service()
export class ConfigValidator {
  validate(config: IConfig): ValidationError | null {
    return ConfigSchema.validate(config).error || null;
  }
}

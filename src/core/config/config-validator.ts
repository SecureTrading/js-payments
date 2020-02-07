import Joi from 'joi';
import { Service } from 'typedi';
import { IConfig } from './model/IConfig';
import { ValidationError } from 'joi';
import { ConfigSchema } from './schema/config-schema';

@Service()
export class ConfigValidator {
  validate(config: IConfig): ValidationError | null {
    return Joi.validate(config, ConfigSchema).error;
  }
}

import { BrowserLocalStorage } from '../services/storage/BrowserLocalStorage';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';
import { instance, mock, verify, when } from 'ts-mockito';
import { ConfigService } from './ConfigService';
import { IConfig } from './model/IConfig';
import { ValidationError } from 'joi';

describe('ConfigService', () => {
  let storageMock: BrowserLocalStorage;
  let resolverMock: ConfigResolver;
  let validatorMock: ConfigValidator;
  let configService: ConfigService;

  const config: IConfig = ({ foo: 'bar' } as unknown) as IConfig;
  const fullConfig: IConfig = ({ bar: 'baz' } as unknown) as IConfig;

  beforeEach(() => {
    storageMock = mock(BrowserLocalStorage);
    resolverMock = mock(ConfigResolver);
    validatorMock = mock(ConfigValidator);
    configService = new ConfigService(instance(storageMock), instance(resolverMock), instance(validatorMock));

    when(resolverMock.resolve(config)).thenReturn(fullConfig);
  });

  describe('initialize', () => {
    it('clears the already existing config in storage', () => {
      configService.initialize(config);

      verify(storageMock.setItem('app.config', null)).once();
    });

    it('resolves the full config and stores it in storage', () => {
      configService.initialize(config);

      verify(storageMock.setItem('app.config', JSON.stringify(fullConfig))).once();
    });

    it('returns the full config', () => {
      expect(configService.initialize(config)).toBe(fullConfig);
    });

    it('throws an error if config validation fails', () => {
      const validationError = instance(mock<ValidationError>());

      when(validatorMock.validate(fullConfig)).thenReturn(validationError);

      expect(() => configService.initialize(config)).toThrow();
    });
  });

  describe('update', () => {
    it('resolves the full config and stores it in storage', () => {
      configService.initialize(config);

      verify(storageMock.setItem('app.config', JSON.stringify(fullConfig))).once();
    });

    it('returns the full config', () => {
      expect(configService.initialize(config)).toBe(fullConfig);
    });

    it('throws an error if config validation fails', () => {
      const validationError = instance(mock<ValidationError>());

      when(validatorMock.validate(fullConfig)).thenReturn(validationError);

      expect(() => configService.initialize(config)).toThrow();
    });
  });
});

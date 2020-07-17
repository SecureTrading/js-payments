import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';
import { instance, mock, verify, when } from 'ts-mockito';
import { ConfigService } from './ConfigService';
import { IConfig } from '../../shared/model/config/IConfig';
import { ValidationError } from '@hapi/joi';

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

  describe('update', () => {
    it('resolves the full config and stores it in storage', () => {
      configService.update(config);

      verify(storageMock.setItem('app.config', fullConfig)).once();
    });

    it('returns the full config', () => {
      expect(configService.update(config)).toBe(fullConfig);
    });

    it('throws an error if config validation fails', () => {
      const validationError = instance(mock<ValidationError>());

      when(validatorMock.validate(fullConfig)).thenReturn(validationError);

      expect(() => configService.update(config)).toThrow();
    });
  });

  describe('clear', () => {
    it('sets config value to null', () => {
      configService.clear();

      verify(storageMock.setItem('app.config', null)).once();
    });
  });
});

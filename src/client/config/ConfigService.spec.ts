import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';
import { anything, instance, mock, when } from 'ts-mockito';
import { ConfigService } from './ConfigService';
import { IConfig } from '../../shared/model/config/IConfig';
import { ValidationError } from '@hapi/joi';
import { MessageBus } from '../../application/core/shared/MessageBus';
import { MessageBusMock } from '../../testing/mocks/MessageBusMock';
import { PUBLIC_EVENTS } from '../../application/core/shared/EventTypes';
import { take, toArray } from 'rxjs/operators';

describe('ConfigService', () => {
  let resolverMock: ConfigResolver;
  let validatorMock: ConfigValidator;
  let configService: ConfigService;
  let messageBus: MessageBus;

  const config: IConfig = ({ foo: 'bar' } as unknown) as IConfig;
  const fullConfig: IConfig = ({ bar: 'baz' } as unknown) as IConfig;

  beforeEach(() => {
    resolverMock = mock(ConfigResolver);
    validatorMock = mock(ConfigValidator);
    messageBus = (new MessageBusMock() as unknown) as MessageBus;
    configService = new ConfigService(instance(resolverMock), instance(validatorMock), messageBus);

    when(resolverMock.resolve(config)).thenReturn(fullConfig);
    when(validatorMock.validate(config)).thenReturn(null);
  });

  describe('update', () => {
    it('resolves the full config and publishes it to message bus', () => {
      spyOn(messageBus, 'publish');

      const result = configService.update(config);

      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.CONFIG_CHANGED, data: fullConfig });
      expect(result).toBe(fullConfig);
      expect(configService.getConfig()).toBe(fullConfig);
    });

    it('throws an error if config validation fails', () => {
      const validationError = instance(mock<ValidationError>());

      when(validatorMock.validate(fullConfig)).thenReturn(validationError);

      expect(() => configService.update(config)).toThrow();
    });
  });

  describe('clear', () => {
    it('sets config value to null and publishes it to message bus', () => {
      spyOn(messageBus, 'publish');

      configService.clear();

      expect(messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.CONFIG_CHANGED, data: null });
      expect(configService.getConfig()).toBeNull();
    });
  });

  describe('getConfig$()', () => {
    const config1: IConfig = ({ foo: 'aaa' } as unknown) as IConfig;
    const config2: IConfig = ({ foo: 'bbb' } as unknown) as IConfig;
    const config3: IConfig = ({ foo: 'ccc' } as unknown) as IConfig;

    beforeEach(() => {
      when(resolverMock.resolve(anything())).thenCall(value => value);
    });

    it('returns config as observable once', done => {
      configService
        .getConfig$(false)
        .pipe(take(3), toArray())
        .subscribe(result => {
          expect(result).toEqual([config1]);
          done();
        });

      configService.update(config1);
      configService.update(config2);
      configService.update(config3);
    });

    it('returns config changes as observable', done => {
      configService
        .getConfig$(true)
        .pipe(take(3), toArray())
        .subscribe(result => {
          expect(result).toEqual([config1, config2, config3]);
          done();
        });

      configService.update(config1);
      configService.update(config2);
      configService.update(config3);
    });
  });
});

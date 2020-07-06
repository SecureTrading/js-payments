import { Container } from 'typedi';
import { WINDOW } from './shared/dependency-injection/InjectionTokens';
import './application/dependency-injection/ServiceDefinitions';
import './testing/ServicesOverrides';

if (!Container.has(WINDOW)) {
  Container.set(WINDOW, window);
}

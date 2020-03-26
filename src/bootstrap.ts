import { Container } from 'typedi';
import { WINDOW } from './shared/dependency-injection/InjectionTokens';

if (!Container.has(WINDOW)) {
  Container.set(WINDOW, window);
}

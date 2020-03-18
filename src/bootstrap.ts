import { Container } from 'typedi';
import { WINDOW } from './core/dependency-injection/InjectionTokens';

if (!Container.has(WINDOW)) {
  Container.set(WINDOW, window);
}

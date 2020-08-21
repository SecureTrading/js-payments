import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import { Selectors } from '../../core/shared/Selectors';
import '../../core/shared/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';

(() => {
  Container.get(ComponentBootstrap).run(Selectors.EXPIRATION_DATE_IFRAME, ExpirationDate);
})();

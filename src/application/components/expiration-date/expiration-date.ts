import './expiration-date.scss';
import { ExpirationDate } from './ExpirationDate';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';
import { EXPIRATION_DATE_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(ComponentBootstrap).run(EXPIRATION_DATE_IFRAME, ExpirationDate);
})();

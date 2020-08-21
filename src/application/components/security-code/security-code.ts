import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Selectors } from '../../core/shared/Selectors';
import '../../core/shared/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';

(() => {
  Container.get(ComponentBootstrap).run(Selectors.SECURITY_CODE_IFRAME, SecurityCode);
})();

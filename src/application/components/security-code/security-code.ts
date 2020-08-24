import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';
import { SECURITY_CODE_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(ComponentBootstrap).run(SECURITY_CODE_IFRAME, SecurityCode);
})();

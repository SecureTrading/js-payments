import './security-code.scss';
import { SecurityCode } from './SecurityCode';
import { Container } from 'typedi';
import { FrameIdentifier } from '../../../shared/services/message-bus/FrameIdentifier';
import { Selectors } from '../../core/shared/Selectors';

(() => {
  Container.get(FrameIdentifier).setFrameName(Selectors.SECURITY_CODE_IFRAME);

  return SecurityCode.ifFieldExists() && Container.get(SecurityCode);
})();

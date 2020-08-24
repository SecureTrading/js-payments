import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';
import { CONTROL_FRAME_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(ComponentBootstrap).run(CONTROL_FRAME_IFRAME, ControlFrame);
})();

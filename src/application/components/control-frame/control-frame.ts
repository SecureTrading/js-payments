import './control-frame.scss';
import { ControlFrame } from './ControlFrame';
import { Selectors } from '../../core/shared/Selectors';
import '../../core/shared/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';

(() => {
  Container.get(ComponentBootstrap).run(Selectors.CONTROL_FRAME_IFRAME, ControlFrame);
})();

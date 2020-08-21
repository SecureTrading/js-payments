import './card-number.scss';
import { CardNumber } from './CardNumber';
import { Selectors } from '../../core/shared/Selectors';
import '../../core/shared/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';

(() => {
  Container.get(ComponentBootstrap).run(Selectors.CARD_NUMBER_IFRAME, CardNumber);
})();

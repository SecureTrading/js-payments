import './card-number.scss';
import { CardNumber } from './CardNumber';
import '../../core/shared/override-domain/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { Container } from 'typedi';
import { CARD_NUMBER_IFRAME } from '../../core/models/constants/Selectors';

(() => {
  Container.get(ComponentBootstrap).run(CARD_NUMBER_IFRAME, CardNumber);
})();

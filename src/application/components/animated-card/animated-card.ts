import '@securetrading/js-payments-card/dist/stcardstyle.css';
import Card from '@securetrading/js-payments-card/stcard.js';
import { Container } from 'typedi';
import { Selectors } from '../../core/shared/Selectors';
import '../../core/shared/OverrideDomain';
import { ComponentBootstrap } from '../../core/component-bootstrap/ComponentBootstrap';
import { AnimatedCard } from './AnimatedCard';

(() => {
  if (Card && document.URL.includes('animated')) {
    Container.get(ComponentBootstrap).run(Selectors.ANIMATED_CARD_COMPONENT_IFRAME, AnimatedCard);
  }
})();

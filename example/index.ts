/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import Card from '@securetrading/js-payments-card/dist/stcard.js';
import '@securetrading/js-payments-card/dist/stcardstyle.css';
import './style.scss';

const card = new Card({
  animatedCardContainer: 'st-animated-card',
  locale: 'en_GB'
});

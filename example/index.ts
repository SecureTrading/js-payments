/**
 * STJS Example.
 * This is code fired on merchant's side.
 * It can be treated as a reference for merchants how to integrate with STJS.
 */
import './style.scss';
import Card from '@securetrading/js-payments-card/dist/stcard.js';
import '@securetrading/js-payments-card/dist/stcardstyle.css';

const card = new Card({
  locale: 'en_GB',
  animatedCardContainer: 'st-animated-card'
});
console.log(card);

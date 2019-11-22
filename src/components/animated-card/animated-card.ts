import '@securetrading/js-payments-card/dist/stcardstyle.css';
import Card from '@securetrading/js-payments-card/stcard.js';

if (Card) {
  const card: Card = new Card({
    animatedCardContainer: 'st-animated-card',
    locale: 'en_GB'
  });
} else {
  throw new Error('Animated card has not been loaded');
}

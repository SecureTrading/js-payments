import './animated-card.scss';
import AnimatedCard from './AnimatedCard';

(() => {
  return AnimatedCard.ifCardExists() && new AnimatedCard();
})();

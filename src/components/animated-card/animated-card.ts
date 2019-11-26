import '@securetrading/js-payments-card/dist/stcardstyle.css';
import Card from '@securetrading/js-payments-card/stcard.js';
import MessageBus from '../../core/shared/MessageBus';

if (Card) {
  const card: Card = new Card({
    animatedCardContainer: 'st-animated-card',
    locale: 'en_GB'
  });

  const messageBus: MessageBus = new MessageBus();
  messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
    console.error('CARD');
    console.error(data);
    card.onCardNumberInput();
  });

  messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
    console.error('CHANGE_EXPIRATION_DATE');
    console.error(data);
    card.onCardNumberChange();
  });

  messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
    console.error('CHANGE_SECURITY_CODE');
    console.error(data);
    card.onCardNumberChange();
  });
} else {
  throw new Error('Animated card has not been loaded');
}

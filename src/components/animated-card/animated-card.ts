import '@securetrading/js-payments-card/dist/stcardstyle.css';
// @ts-ignore
import Card from '@securetrading/js-payments-card/stcard.js';
import MessageBus from '../../core/shared/MessageBus';

// @ts-ignore
if (Card && document.URL.includes('animated')) {
  console.error('Jest karta 1');
  // @ts-ignore
  const card: Card = new Card({
    animatedCardContainer: 'st-animated-card',
    locale: 'en_GB'
  });

  (function() {
    console.error('setMessageBusSubscriber');
    const messageBus: MessageBus = new MessageBus();
    messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      const { value } = data;
      console.error(data);
      card.onCardNumberChange(value, true);
    });
    messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
      const { value } = data;
      console.error(data);
      card.onExpirationDateChange(value, true);
    });
    messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
      const { value } = data;
      console.error(data);
      card.onSecurityCodeChange(value, true);
    });
  })();

  // setMessageBusSubscriber(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, card.onExpirationDateChange());
  // setMessageBusSubscriber(MessageBus.EVENTS.CHANGE_SECURITY_CODE, card.onSecurityCodeChange());
  // setMessageBusSubscriber(MessageBus.EVENTS.FOCUS_CARD_NUMBER, card.onFieldFocus());
  // setMessageBusSubscriber(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, card.onFieldFocus());
  // setMessageBusSubscriber(MessageBus.EVENTS.FOCUS_SECURITY_CODE, card.onFieldFocus());
}

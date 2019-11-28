import '@securetrading/js-payments-card/dist/stcardstyle.css';
// @ts-ignore
import Card from '@securetrading/js-payments-card/stcard.js';
import MessageBus from '../../core/shared/MessageBus';

// @ts-ignore
function setMessageBusSubscriber(event: string, func: () => void) {
  const messageBus: MessageBus = new MessageBus();
  messageBus.subscribe(event, (data: IFormFieldState) => {
    console.error(event);
    console.error(data);
    func();
  });
}

// @ts-ignore
if (Card) {
  // @ts-ignore
  const card: Card = new Card({
    locale: 'en_GB'
  });

  // setMessageBusSubscriber(MessageBus.EVENTS.CHANGE_CARD_NUMBER, card.onCardNumberChange());
  // setMessageBusSubscriber(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, card.onExpirationDateChange());
  // setMessageBusSubscriber(MessageBus.EVENTS.CHANGE_SECURITY_CODE, card.onSecurityCodeChange());
  // setMessageBusSubscriber(MessageBus.EVENTS.FOCUS_CARD_NUMBER, card.onFieldFocus());
  // setMessageBusSubscriber(MessageBus.EVENTS.FOCUS_EXPIRATION_DATE, card.onFieldFocus());
  // setMessageBusSubscriber(MessageBus.EVENTS.FOCUS_SECURITY_CODE, card.onFieldFocus());
} else {
  throw new Error('Animated card has not been loaded');
}

import '@securetrading/js-payments-card/dist/stcardstyle.css';
// @ts-ignore
import Card from '@securetrading/js-payments-card/stcard.js';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { MessageBus } from '../../core/shared/MessageBus';
import { BrowserLocalStorage } from '../../core/services/storage/BrowserLocalStorage';
import { Container } from 'typedi';

// @ts-ignore
if (Card && document.URL.includes('animated')) {
  const localStorage = Container.get(BrowserLocalStorage);
  // @ts-ignore
  const card: Card = new Card({
    animatedCardContainer: 'st-animated-card',
    locale: localStorage.getItem('locale') ? localStorage.getItem('locale') : 'en_GB'
  });

  (() => {
    const messageBus: MessageBus = new MessageBus();
    messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: IFormFieldState) => {
      const { value } = data;
      card.onCardNumberChange(value, true);
    });
    messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: IFormFieldState) => {
      const { value } = data;
      card.onExpirationDateChange(value, true);
    });
    messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: IFormFieldState) => {
      const { value } = data;
      card.onSecurityCodeChange(value, true);
    });
    messageBus.subscribe(MessageBus.EVENTS.FOCUS_SECURITY_CODE, (data: IFormFieldState) => {
      card.onFieldFocusOrBlur(data);
    });
    messageBus.subscribe(MessageBus.EVENTS.BLUR_SECURITY_CODE, (data: IFormFieldState) => {
      card.onFieldFocusOrBlur(data);
    });
  })();
}

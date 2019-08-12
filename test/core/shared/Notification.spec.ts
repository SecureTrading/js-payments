import Notification from '../../../src/core/shared/Notification';
import MessageBus from '../../../src/core/shared/MessageBus';

localStorage.merchantTranslations =
  '{"Timeout":"Limit czasu","An error occurred":"Wystąpił błąd","Merchant validation failure":"Błąd weryfikacji sprzedawcy","Payment has been cancelled":"Płatność została anulowana","Value mismatch pattern":"Błędny format","Invalid response":"Niepoprawna odpowiedź","Invalid request":"Nieprawidłowe żądanie","Value is too short":"Wartość jest za krótka","Payment has been authorized":"Płatność została autoryzowana","Amount and currency are not set":"Kwota i waluta nie są ustawione","Payment has been successfully processed":"Płatność została pomyślnie przetworzona","Card number":"Numer karty","Expiration date":"Data ważności","Security code":"Kod bezpieczeństwa","Ok":"Płatność została pomyślnie przetworzona","Method not implemented":"Metoda nie została zaimplementowana","Form is not valid":"Formularz jest nieprawidłowy","Pay":"Zapłać","Processing":"Przetwarzanie","Invalid field":"Nieprawidłowe pole","Card number is invalid":"Numer karty jest nieprawidłowy"}';

// given
describe('Notification', () => {
  const { instance } = notificationFixture();
  // when
  beforeEach(() => {
    // @ts-ignore
    instance._messageBus.publish = jest.fn();
  });

  // given
  describe('error()', () => {
    // then
    it('should send error notification', () => {
      instance.error('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'ERROR'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('info()', () => {
    // then
    it('should send info notification', () => {
      instance.info('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'INFO'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('success()', () => {
    // then
    it('should send info success', () => {
      instance.success('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'SUCCESS'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });

  // given
  describe('warning()', () => {
    // then
    it('should send info warning', () => {
      instance.warning('abc');
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith({
        data: {
          content: 'abc',
          type: 'WARNING'
        },
        type: MessageBus.EVENTS_PUBLIC.NOTIFICATION
      });
    });
  });
});

function notificationFixture() {
  const instance: Notification = new Notification();
  return { instance };
}

export interface IValidationMessageBus {
  cardNumber: { message: string; state: boolean };
  expirationDate: { message: string; state: boolean };
  securityCode: { message: string; state: boolean };
}

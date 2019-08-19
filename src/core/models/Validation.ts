interface IErrorData {
  errordata: [];
  errormessage: string;
}

interface IMessageBusValidateField {
  field: string;
  message: string;
}

interface IValidation {
  pan: boolean;
  expirydate: boolean;
  securitycode: boolean;
}

interface IValidationMessageBus {
  cardNumber: { message: string; state: boolean };
  expirationDate: { message: string; state: boolean };
  securityCode: { message: string; state: boolean };
}

export { IErrorData, IMessageBusValidateField, IValidation, IValidationMessageBus };

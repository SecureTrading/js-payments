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

export { IErrorData, IMessageBusValidateField, IValidation };

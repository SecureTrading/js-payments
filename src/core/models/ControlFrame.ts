import { IFormFieldState } from './FormFieldState';

interface ISetRequestTypes {
  requestTypes: string[];
}

interface ISubmitData {
  fieldsToSubmit?: string[];
}

interface IFormFieldsDetails {
  cardNumber: IFormFieldState;
  expirationDate: IFormFieldState;
  securityCode: IFormFieldState;
}

interface IFormFieldsValidity {
  cardNumber: {
    message: string;
    state: boolean;
  };
  expirationDate: {
    message: string;
    state: boolean;
  };
  securityCode: {
    message: string;
    state: boolean;
  };
}

const FormFieldsDetails: IFormFieldsDetails = {
  cardNumber: {
    validity: false,
    value: ''
  },
  expirationDate: {
    validity: false,
    value: ''
  },
  securityCode: {
    validity: false,
    value: ''
  }
};
const FormFieldsValidity: IFormFieldsValidity = {
  cardNumber: {
    message: '',
    state: false
  },
  expirationDate: {
    message: '',
    state: false
  },
  securityCode: {
    message: '',
    state: false
  }
};

interface IDecodedJwt {
  iat?: number;
  iss?: string;
  payload: {
    accounttypedescription: string;
    baseamount: string;
    currencyiso3a: string;
    locale: string;
    mainamount: string;
    pan: string;
    expirydate: string;
    securitycode: string;
    sitereference: string;
  };
}

export {
  FormFieldsDetails,
  FormFieldsValidity,
  IDecodedJwt,
  IFormFieldsDetails,
  IFormFieldsValidity,
  ISetRequestTypes,
  ISubmitData
};

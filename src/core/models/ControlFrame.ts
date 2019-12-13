import { IFormFieldState } from '../shared/FormFieldState';

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

export {
  FormFieldsDetails,
  FormFieldsValidity,
  IFormFieldsValidity,
  ISetRequestTypes,
  ISubmitData,
  IFormFieldsDetails
};

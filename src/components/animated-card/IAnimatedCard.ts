interface ICardDetails {
  cardNumber: string;
  expirationDate: string;
  logo: string;
  securityCode: string;
  type: string;
}

interface ISubscribeObject {
  formattedValue: string;
  validity?: object;
  value: string;
}

export { ICardDetails, ISubscribeObject };

import StTransport from '../classes/StTransport.class';

export default class Payment {
  private stTransport: StTransport;

  constructor() {
    this.stTransport = new StTransport({ jwt: '' });
  }

  cacheTokenize(cardDetails: any) {
    let requestBody = {
      requesttypedescription: 'CACHETOKENISE',
      sitereference: 'live2',
      accounttypedescription: 'ECOM',
      pan: cardDetails.pan,
      expirydate: cardDetails.expirydate,
      securitycode: cardDetails.securitycode,
      baseamount: '100',
      currencyiso3a: 'GBP'
    };

    this.stTransport.sendRequest(requestBody);
  }
}

const iframesEndpoints = {
  cardNumber: '//localhost:8080/creditCard.html',
  secuirityCode: '//localhost:8080/securityCode.html',
  expirationDate: '//localhost:8080/expirationDate.html',
};

const styleForIframe: any = {
  border: 'none',
  margin: '0',
  padding: '0',
  width: '1px',
  minWidth: '100%',
  overflow: 'hidden',
  display: 'block',
  height: '120px',
};

export { iframesEndpoints, styleForIframe };

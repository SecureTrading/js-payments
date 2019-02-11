const iframesEndpoints = {
  cardNumber: '//localhost:8081/cardNumber.html',
  cardVerificationCode: '//localhost:8081/cardVerificationCode.html',
  expirationDate: '//localhost:8081/expirationDate.html',
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

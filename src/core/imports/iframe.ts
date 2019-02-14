const iframesEndpoints = {
  cardNumber: '//localhost:8081/',
  securityCode: '//localhost:8082',
  expirationDate: '//localhost:8083',
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

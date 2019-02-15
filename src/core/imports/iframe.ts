const appEndpoint = 'http://localhost:8080';

const iframesEndpoints = {
  cardNumber: 'http://localhost:8081',
  securityCode: 'http://localhost:8082',
  expirationDate: 'http://localhost:8083',
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

export { appEndpoint, iframesEndpoints, styleForIframe };

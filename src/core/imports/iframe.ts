const appEndpoint = 'http://localhost:8080';

const iframesEndpoints = {
  cardNumber: 'http://localhost:8081',
  expirationDate: 'http://localhost:8082',
  securityCode: 'http://localhost:8083'
};

const defaultIframeStyle: any = {
  border: 'none',
  display: 'block',
  height: '130px',
  margin: '0',
  minWidth: '100%',
  overflow: 'hidden',
  padding: '0'
};

export { appEndpoint, iframesEndpoints, defaultIframeStyle };

const appEndpoint = 'http://localhost:8080';

const iframesEndpoints = {
  cardNumber: `${appEndpoint}/credit-card-number.html`,
  expirationDate: `${appEndpoint}/expiration-date.html`,
  securityCode: `${appEndpoint}/security-code.html`
};

const defaultIframeStyle: any = {
  border: 'none',
  display: 'block',
  height: '130px',
  margin: '0',
  minWidth: '100%',
  overflow: 'hidden',
  padding: '0',
  width: '1px'
};

export { appEndpoint, iframesEndpoints, defaultIframeStyle };

const appEndpoint = 'http://localhost:8080';

const iframesEndpoints = {
  cardNumber: 'http://localhost:8081',
  expirationDate: 'http://localhost:8082',
  securityCode: 'http://localhost:8083',
};

const defaultIframeStyle: any = {
  border: 'none',
  margin: '0',
  padding: '0',
  width: '1px',
  minWidth: '100%',
  overflow: 'hidden',
  display: 'block',
  height: '130px',
};

const getStylesFromUrl = (endpoint: string) => {
  let query = window.location.href;
  query = decodeURI(query)
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
    .replace(endpoint, '');
  return JSON.parse(query);
};

const applyStylesToIframe = (id: string, endpoint: string) => {
  let input = <HTMLInputElement>document.getElementById(id);
  let styles = getStylesFromUrl(endpoint);
  Object.assign(input.style, styles.style.style.base);
};

export {
  appEndpoint,
  iframesEndpoints,
  defaultIframeStyle,
  getStylesFromUrl,
  applyStylesToIframe,
};

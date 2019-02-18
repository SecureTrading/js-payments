import { applyStylesToIframe } from '../imports/iframe';

const securityCodeDOMListener = () => {
  document.addEventListener('DOMContentLoaded', () => {
    applyStylesToIframe('security-code', 'http://localhost:8083/?');
  });
};

export { securityCodeDOMListener };

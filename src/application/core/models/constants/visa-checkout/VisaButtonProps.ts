import { environment } from '../../../../../environments/environment';

export const VisaButtonProps = {
  alt: 'Visa Checkout',
  class: 'v-button',
  id: 'v-button',
  role: 'button',
  src: environment.VISA_CHECKOUT_URLS.TEST_BUTTON_URL
};

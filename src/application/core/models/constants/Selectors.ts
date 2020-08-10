// @TODO: changed implementation and references to const
import { environment } from '../../../../environments/environment';

const CARD_NUMBER_COMPONENT_NAME: string = 'cardNumber';
const CARD_NUMBER_IFRAME: string = 'st-card-number-iframe';
const CARD_NUMBER_INPUT: string = 'st-card-number-input';
const CARD_NUMBER_INPUT_SELECTOR: string = 'st-card-number';
const CARD_NUMBER_MESSAGE: string = 'st-card-number-message';
const CARD_NUMBER_LABEL: string = 'st-card-number-label';

const EXPIRATION_DATE_COMPONENT_NAME: string = 'expirationDate';
const EXPIRATION_DATE_IFRAME: string = 'st-expiration-date-iframe';
const EXPIRATION_DATE_INPUT: string = 'st-expiration-date-input';
const EXPIRATION_DATE_INPUT_SELECTOR: string = 'st-expiration-date';
const EXPIRATION_DATE_MESSAGE: string = 'st-expiration-date-message';
const EXPIRATION_DATE_LABEL: string = 'st-expiration-date-label';

const SECURITY_CODE_COMPONENT_NAME: string = 'securityCode';
const SECURITY_CODE_IFRAME: string = 'st-security-code-iframe';
const SECURITY_CODE_INPUT: string = 'st-security-code-input';
const SECURITY_CODE_INPUT_SELECTOR: string = 'st-security-code';
const SECURITY_CODE_MESSAGE: string = 'st-security-code-message';
const SECURITY_CODE_LABEL: string = 'st-security-code-label';

const NOTIFICATION_FRAME_ID: string = 'st-notification-frame';
const NOTIFICATION_FRAME_CORE_CLASS: string = 'notification-frame';
const NOTIFICATION_FRAME_ERROR_CLASS: string = 'notification-frame--error';
const NOTIFICATION_FRAME_INFO_CLASS: string = 'notification-frame--info';
const NOTIFICATION_FRAME_SUCCESS_CLASS: string = 'notification-frame--success';
const NOTIFICATION_FRAME_CANCEL_CLASS: string = 'notification-frame--cancel';

const CONTROL_FRAME_COMPONENT_NAME: string = 'controlFrame';
const CONTROL_FRAME_IFRAME: string = 'st-control-frame-iframe';

const MERCHANT_FORM_SELECTOR: string = 'st-form';
const MERCHANT_PARENT_FRAME: string = 'st-parent-frame';

const CARD_NUMBER_COMPONENT: string = `${environment.FRAME_URL}/card-number.html`;
const EXPIRATION_DATE_COMPONENT: string = `${environment.FRAME_URL}/expiration-date.html`;
const SECURITY_CODE_COMPONENT: string = `${environment.FRAME_URL}/security-code.html`;
const CONTROL_FRAME_COMPONENT: string = `${environment.FRAME_URL}/control-frame.html`;
const ANIMATED_CARD_COMPONENT: string = `${environment.FRAME_URL}/animated-card.html`;

const ANIMATED_CARD_INPUT_SELECTOR: string = 'st-animated-card';
const ANIMATED_CARD_COMPONENT_IFRAME: string = 'st-animated-card-iframe';
const ANIMATED_CARD_COMPONENT_NAME: string = 'animatedCard';

export {
  ANIMATED_CARD_COMPONENT,
  ANIMATED_CARD_COMPONENT_IFRAME,
  ANIMATED_CARD_COMPONENT_NAME,
  ANIMATED_CARD_INPUT_SELECTOR,
  CARD_NUMBER_COMPONENT,
  CARD_NUMBER_COMPONENT_NAME,
  CARD_NUMBER_IFRAME,
  CARD_NUMBER_INPUT,
  CARD_NUMBER_INPUT_SELECTOR,
  CARD_NUMBER_LABEL,
  CARD_NUMBER_MESSAGE,
  CONTROL_FRAME_COMPONENT,
  CONTROL_FRAME_COMPONENT_NAME,
  CONTROL_FRAME_IFRAME,
  EXPIRATION_DATE_COMPONENT,
  EXPIRATION_DATE_COMPONENT_NAME,
  EXPIRATION_DATE_IFRAME,
  EXPIRATION_DATE_INPUT,
  EXPIRATION_DATE_INPUT_SELECTOR,
  EXPIRATION_DATE_LABEL,
  EXPIRATION_DATE_MESSAGE,
  MERCHANT_FORM_SELECTOR,
  MERCHANT_PARENT_FRAME,
  NOTIFICATION_FRAME_CANCEL_CLASS,
  NOTIFICATION_FRAME_CORE_CLASS,
  NOTIFICATION_FRAME_ERROR_CLASS,
  NOTIFICATION_FRAME_ID,
  NOTIFICATION_FRAME_INFO_CLASS,
  NOTIFICATION_FRAME_SUCCESS_CLASS,
  SECURITY_CODE_COMPONENT,
  SECURITY_CODE_COMPONENT_NAME,
  SECURITY_CODE_IFRAME,
  SECURITY_CODE_INPUT,
  SECURITY_CODE_INPUT_SELECTOR,
  SECURITY_CODE_LABEL,
  SECURITY_CODE_MESSAGE
};

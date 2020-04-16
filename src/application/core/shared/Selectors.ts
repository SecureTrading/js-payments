import { environment } from '../../../environments/environment';

export class Selectors {
  public static readonly CARD_NUMBER_COMPONENT_NAME: string = 'cardNumber';
  public static readonly CARD_NUMBER_IFRAME: string = 'st-card-number-iframe';
  public static readonly CARD_NUMBER_INPUT: string = 'st-card-number-input';
  public static readonly CARD_NUMBER_INPUT_SELECTOR: string = 'st-card-number';
  public static readonly CARD_NUMBER_MESSAGE: string = 'st-card-number-message';
  public static readonly CARD_NUMBER_LABEL: string = 'st-card-number-label';

  public static readonly EXPIRATION_DATE_COMPONENT_NAME: string = 'expirationDate';
  public static readonly EXPIRATION_DATE_IFRAME: string = 'st-expiration-date-iframe';
  public static readonly EXPIRATION_DATE_INPUT: string = 'st-expiration-date-input';
  public static readonly EXPIRATION_DATE_INPUT_SELECTOR: string = 'st-expiration-date';
  public static readonly EXPIRATION_DATE_MESSAGE: string = 'st-expiration-date-message';
  public static readonly EXPIRATION_DATE_LABEL: string = 'st-expiration-date-label';

  public static readonly SECURITY_CODE_COMPONENT_NAME: string = 'securityCode';
  public static readonly SECURITY_CODE_IFRAME: string = 'st-security-code-iframe';
  public static readonly SECURITY_CODE_INPUT: string = 'st-security-code-input';
  public static readonly SECURITY_CODE_INPUT_SELECTOR: string = 'st-security-code';
  public static readonly SECURITY_CODE_MESSAGE: string = 'st-security-code-message';
  public static readonly SECURITY_CODE_LABEL: string = 'st-security-code-label';

  public static readonly NOTIFICATION_FRAME_IFRAME: string = 'st-notification-frame-iframe';
  public static readonly NOTIFICATION_FRAME_ID: string = 'st-notification-frame';
  public static readonly NOTIFICATION_FRAME_CORE_CLASS: string = 'notification-frame';
  public static readonly NOTIFICATION_FRAME_ERROR_CLASS: string = 'notification-frame--error';
  public static readonly NOTIFICATION_FRAME_INFO_CLASS: string = 'notification-frame--info';
  public static readonly NOTIFICATION_FRAME_SUCCESS_CLASS: string = 'notification-frame--success';
  public static readonly NOTIFICATION_FRAME_CANCEL_CLASS: string = 'notification-frame--cancel';

  public static readonly CONTROL_FRAME_COMPONENT_NAME: string = 'controlFrame';
  public static readonly CONTROL_FRAME_IFRAME: string = 'st-control-frame-iframe';

  public static MERCHANT_FORM_SELECTOR: string = 'st-form';
  public static MERCHANT_PARENT_FRAME: string = 'st-parent-frame';

  public static CARD_NUMBER_COMPONENT: string = `${environment.FRAME_URL}/card-number.html`;
  public static EXPIRATION_DATE_COMPONENT: string = `${environment.FRAME_URL}/expiration-date.html`;
  public static SECURITY_CODE_COMPONENT: string = `${environment.FRAME_URL}/security-code.html`;
  public static CONTROL_FRAME_COMPONENT: string = `${environment.FRAME_URL}/control-frame.html`;
  public static readonly ANIMATED_CARD_COMPONENT: string = `${environment.FRAME_URL}/animated-card.html`;

  public static readonly ANIMATED_CARD_INPUT_SELECTOR: string = 'st-animated-card';
  public static readonly ANIMATED_CARD_COMPONENT_IFRAME: string = 'st-animated-card-iframe';
  public static readonly ANIMATED_CARD_COMPONENT_NAME: string = 'animatedCard';
}

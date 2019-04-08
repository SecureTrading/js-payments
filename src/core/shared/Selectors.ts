import { environment } from '../../environments/environment';

export default class Selectors {
  public static readonly CARD_NUMBER_INPUT_SELECTOR: string = 'st-card-number-input';
  public static readonly CARD_NUMBER_MESSAGE_SELECTOR: string = 'st-card-number-message';

  public static readonly EXPIRATION_DATE_INPUT_SELECTOR: string = 'st-expiration-date-input';
  public static readonly EXPIRATION_DATE_MESSAGE_SELECTOR: string = 'st-expiration-date-message';

  public static readonly SECURITY_CODE_INPUT_SELECTOR: string = 'st-security-code-input';
  public static readonly SECURITY_CODE_MESSAGE_SELECTOR: string = 'st-security-code-message';

  public static readonly ANIMATED_CARD_INPUT_SELECTOR: string = 'st-animated-card';
  public static readonly ANIMATED_CARD_CREDIT_CARD_ID = 'st-animated-card-number';
  public static readonly ANIMATED_CARD_EXPIRATION_DATE_ID = 'st-animated-card-expiration-date';
  public static readonly ANIMATED_CARD_SECURITY_CODE_ID = 'st-animated-card-security-code';
  public static readonly ANIMATED_CARD_SECURITY_CODE_FRONT_ID = 'st-animated-card-security-code-front';
  public static readonly ANIMATED_CARD_SIDE_FRONT: string = 'st-animated-card-side-front';
  public static readonly ANIMATED_CARD_SIDE_BACK: string = 'st-animated-card-side-back';

  public static readonly CONTROL_FRAME_BUTTON_SELECTOR: string = 'st-control-frame-button';

  public static readonly CARD_NUMBER_COMPONENT_FRAME: string = 'st-card-number-iframe';
  public static readonly SECURITY_CODE_COMPONENT_FRAME: string = 'st-security-code-iframe';
  public static readonly EXPIRATION_DATE_COMPONENT_FRAME: string = 'st-expiration-date-iframe';
  public static readonly NOTIFICATION_FRAME_COMPONENT_FRAME: string = 'st-notification-frame-iframe';
  public static readonly CONTROL_FRAME_COMPONENT_FRAME: string = 'st-control-frame-iframe';
  public static readonly ANIMATED_CARD_COMPONENT_FRAME: string = 'st-animated-card-iframe';

  public static readonly CARD_NUMBER_COMPONENT_NAME: string = 'cardNumber';
  public static readonly SECURITY_CODE_COMPONENT_NAME: string = 'securityCode';
  public static readonly EXPIRATION_DATE_COMPONENT_NAME: string = 'expirationDate';
  public static readonly NOTIFICATION_FRAME_COMPONENT_NAME: string = 'notificationFrame';
  public static readonly CONTROL_FRAME_COMPONENT_NAME: string = 'controlFrame';
  public static readonly ANIMATED_CARD_COMPONENT_NAME: string = 'animatedCard';

  public static readonly CARD_NUMBER_COMPONENT: string = `${environment.FRAME_URL}/card-number.html`;
  public static readonly SECURITY_CODE_COMPONENT: string = `${environment.FRAME_URL}/security-code.html`;
  public static readonly EXPIRATION_DATE_COMPONENT: string = `${environment.FRAME_URL}/expiration-date.html`;
  public static readonly NOTIFICATION_FRAME_COMPONENT: string = `${environment.FRAME_URL}/notification-frame.html`;
  public static readonly CONTROL_FRAME_COMPONENT: string = `${environment.FRAME_URL}/control-frame.html`;
  public static readonly ANIMATED_CARD_COMPONENT: string = `${environment.FRAME_URL}/animated-card.html`;

  public static readonly NOTIFICATION_FRAME_ID: string = 'st-notification-frame';
  public static readonly NOTIFICATION_FRAME_ERROR_CLASS: string = 'notification-frame--error';
  public static readonly NOTIFICATION_FRAME_INFO_CLASS: string = 'notification-frame--info';
  public static readonly NOTIFICATION_FRAME_SUCCESS_CLASS: string = 'notification-frame--success';
  public static readonly NOTIFICATION_FRAME_WARNING_CLASS: string = 'notification-frame--warning';
}

import Element from '../Element';
import Selectors from '../shared/Selectors';
import { Styles } from '../shared/Styler';

class Form {
  private cardNumberMounted: HTMLElement;
  private expirationDateMounted: HTMLElement;
  private securityCodeMounted: HTMLElement;
  private animatedCardMounted: HTMLElement;
  private notificationFrameMounted: HTMLElement;
  private controlFrameMounted: HTMLElement;
  public styles: Styles;
  public onlyWallets: boolean;
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  public fieldsIds: any;
  public jwt: any;
  public origin: any;

  constructor(jwt: any, origin: any, onlyWallets: boolean, fieldsIds: [], styles: Styles) {
    this.styles = styles;
    this.onlyWallets = onlyWallets;
    this.fieldsIds = fieldsIds;
    this.elementsTargets = this.getElementsFields(onlyWallets);
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.origin = origin;
    this._onInit();
  }

  public getElementsFields(onlyWallets: boolean) {
    return onlyWallets
      ? [this.fieldsIds.notificationFrame, this.fieldsIds.controlFrame]
      : [
          this.fieldsIds.cardNumber,
          this.fieldsIds.expirationDate,
          this.fieldsIds.securityCode,
          this.fieldsIds.animatedCard,
          this.fieldsIds.notificationFrame,
          this.fieldsIds.controlFrame
        ];
  }

  public _onInit() {
    if (!this.onlyWallets) {
      this.initCardFields();
    }
    this.initFormFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Inits credit card and animated card fields (if merchant wanted this type of payment)
   */
  public initCardFields() {
    const cardNumber = new Element();
    const expirationDate = new Element();
    const securityCode = new Element();
    const animatedCard = new Element();
    cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles);
    this.cardNumberMounted = cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this.cardNumberMounted);

    expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles);
    this.expirationDateMounted = expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this.expirationDateMounted);

    securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles);
    this.securityCodeMounted = securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this.securityCodeMounted);

    animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME);
    this.animatedCardMounted = animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME);
    this.elementsToRegister.push(this.animatedCardMounted);
  }

  /**
   * Inits necessary fields - notification and control frame
   */
  public initFormFields() {
    const notificationFrame = new Element();
    const controlFrame = new Element();

    notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles);
    this.notificationFrameMounted = notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME);
    this.elementsToRegister.push(this.notificationFrameMounted);

    controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles, { jwt: this.jwt, origin: this.origin });
    this.controlFrameMounted = controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME);
    this.elementsToRegister.push(this.controlFrameMounted);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }
}

export default Form;

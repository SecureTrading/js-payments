import Element from '../Element';
import DomMethods from '../shared/DomMethods';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import { IStyles } from '../shared/Styler';
import Validation from '../shared/Validation';

/**
 * Defines all elements of form and their  placement on merchant site.
 */
class Form {
  public styles: IStyles;
  public params: any; // TODO type?
  public onlyWallets: boolean;
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  public fieldsIds: any;
  public jwt: any;
  public origin: any;
  private stJwt: StJwt;
  private cardNumberMounted: HTMLElement;
  private expirationDateMounted: HTMLElement;
  private securityCodeMounted: HTMLElement;
  private animatedCardMounted: HTMLElement;
  private notificationFrameMounted: HTMLElement;
  private controlFrameMounted: HTMLElement;
  private cardNumber: Element;
  private expirationDate: Element;
  private securityCode: Element;
  private animatedCard: Element;
  private notificationFrame: Element;
  private controlFrame: Element;
  private messageBus: MessageBus;
  private validation: Validation;

  constructor(jwt: any, origin: any, onlyWallets: boolean, fieldsIds: [], styles: IStyles) {
    this.styles = styles;
    this.onlyWallets = onlyWallets;
    this.fieldsIds = fieldsIds;
    this.elementsTargets = this.setElementsFields(onlyWallets);
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.stJwt = new StJwt(jwt);
    this.validation = new Validation();
    this.origin = origin;
    this.params = { locale: this.stJwt.locale };
    this.messageBus = new MessageBus();
    this._onInit();
  }

  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS = 'st-button-submit__disabled';

  /**
   * Sets button properties as text and disable/enable class
   * @param element
   * @param disabledState
   * @private
   */
  private static _setSubmitButtonProperties(element: any, disabledState: boolean) {
    if (disabledState) {
      element.textContent = Language.translations.PROCESSING;
      element.classList.add(Form.SUBMIT_BUTTON_DISABLED_CLASS);
    } else {
      element.textContent = Language.translations.PAY;
      element.classList.remove(Form.SUBMIT_BUTTON_DISABLED_CLASS);
    }

    // @ts-ignore
    element.disabled = disabledState;
    return element;
  }

  /**
   * Gets submit button whether is input or button markup.
   */
  private static getSubmitButton = () =>
    document.querySelector(Form.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
    document.querySelector(Form.SUBMIT_BUTTON_AS_INPUT_MARKUP);

  /**
   * Finds submit button whether is input or button markup and sets properties.
   * @param state
   */
  public static disableSubmitButton(state: boolean) {
    const element = Form.getSubmitButton();
    element && Form._setSubmitButtonProperties(element, state);
  }

  /**
   * Defines form elements if merchant chooses only apms or not.
   * @param onlyWallets
   */
  public setElementsFields = (onlyWallets: boolean) =>
    onlyWallets
      ? [this.fieldsIds.notificationFrame, this.fieldsIds.controlFrame]
      : [
          this.fieldsIds.cardNumber,
          this.fieldsIds.expirationDate,
          this.fieldsIds.securityCode,
          this.fieldsIds.animatedCard,
          this.fieldsIds.notificationFrame,
          this.fieldsIds.controlFrame
        ];

  /**
   * Triggers all necessary
   * @private
   */
  public _onInit() {
    if (!this.onlyWallets) {
      this.initCardFields();
    }
    this.initFormFields();
    this.submitFormListener();
    this.subscribeBlockSubmit();
    this._setMerchantInputListeners();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Inits credit card and animated card fields (if merchant wanted this type of payment)
   */
  public initCardFields() {
    this.cardNumber = new Element();
    this.expirationDate = new Element();
    this.securityCode = new Element();
    this.animatedCard = new Element();

    this.cardNumber.create(Selectors.CARD_NUMBER_COMPONENT_NAME, this.styles, { ...this.params, origin: this.origin });
    this.cardNumberMounted = this.cardNumber.mount(Selectors.CARD_NUMBER_IFRAME);
    this.elementsToRegister.push(this.cardNumberMounted);

    this.expirationDate.create(Selectors.EXPIRATION_DATE_COMPONENT_NAME, this.styles, this.params);
    this.expirationDateMounted = this.expirationDate.mount(Selectors.EXPIRATION_DATE_IFRAME);
    this.elementsToRegister.push(this.expirationDateMounted);

    this.securityCode.create(Selectors.SECURITY_CODE_COMPONENT_NAME, this.styles, this.params);
    this.securityCodeMounted = this.securityCode.mount(Selectors.SECURITY_CODE_IFRAME);
    this.elementsToRegister.push(this.securityCodeMounted);

    this.animatedCard.create(Selectors.ANIMATED_CARD_COMPONENT_NAME, {}, this.params);
    this.animatedCardMounted = this.animatedCard.mount(Selectors.ANIMATED_CARD_COMPONENT_FRAME);
    this.elementsToRegister.push(this.animatedCardMounted);
  }

  /**
   * Inits necessary fields - notification and control frame
   */
  public initFormFields() {
    this.notificationFrame = new Element();
    this.controlFrame = new Element();
    this.notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles, this.params);
    this.notificationFrameMounted = this.notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME);
    this.elementsToRegister.push(this.notificationFrameMounted);

    this.controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles, {
      jwt: this.jwt,
      origin: this.origin
    });
    this.controlFrameMounted = this.controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME);
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

  /**
   * Publishes UPDATE_MERCHANT_FIELDS event to Message Bus.
   */
  private onInput() {
    const messageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Binds all the form inputs and listen to onInput event.
   * @private
   */
  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
    for (const el of els) {
      el.addEventListener('input', this.onInput.bind(this));
    }
  }

  /**
   * Listens to html submit form event, blocks default event, disables submit button and publish event to Message Bus.
   */
  private submitFormListener() {
    document.getElementById(Selectors.MERCHANT_FORM_SELECTOR).addEventListener('submit', (event: Event) => {
      event.preventDefault();
      Form.disableSubmitButton(true);
      this.publishSubmitEvent();
    });
  }

  /**
   * Checks if submit button needs to be blocked.
   */
  private subscribeBlockSubmit() {
    this.messageBus.subscribe(MessageBus.EVENTS.BLOCK_FORM, (data: any) => Form.disableSubmitButton(data.state));
  }

  /**
   * Publishes message bus submit event.
   */
  private publishSubmitEvent() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this.messageBus.publish(messageBusEvent);
  }
}

export default Form;

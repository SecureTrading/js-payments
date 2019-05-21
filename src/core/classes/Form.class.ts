import Element from '../Element';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import { IStyles } from '../shared/Styler';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
class Form {
  // TODO refactor with Cards
  // TODO better name?

  public styles: IStyles;
  public params: any; // TODO type?
  public onlyWallets: boolean;
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  public fieldsIds: any;
  public jwt: any;
  public origin: any;
  private stJwt: StJwt;
  private notificationFrameMounted: HTMLElement;
  private controlFrameMounted: HTMLElement;
  private notificationFrame: Element;
  private controlFrame: Element;
  private messageBus: MessageBus;

  constructor(jwt: any, origin: any, fieldsIds: [], styles: IStyles) {
    this.styles = styles;
    this.fieldsIds = fieldsIds;
    this.elementsTargets = this.setElementsFields();
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.stJwt = new StJwt(jwt);
    this.origin = origin;
    this.params = { locale: this.stJwt.locale };
    this.messageBus = new MessageBus();
    this._onInit();
  }

  /**
   * Defines form elements if merchant chooses only apms or not
   * @param onlyWallets
   */
  public setElementsFields = () => [this.fieldsIds.notificationFrame, this.fieldsIds.controlFrame];

  public _onInit() {
    this.initFormFields();
    this._setMerchantInputListeners();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
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

  private onInput(event: Event) {
    const messageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
    for (const el of els) {
      el.addEventListener('input', this.onInput.bind(this));
    }
  }
}

export default Form;

import Element from '../Element';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';
import RegisterFrames from './RegisterFrames.class';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
export default class CommonFrames extends RegisterFrames {
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  private notificationFrameMounted: HTMLElement;
  private controlFrameMounted: HTMLElement;
  private notificationFrame: Element;
  private controlFrame: Element;
  private messageBus: MessageBus;
  private submitOnSuccess: boolean;
  private submitOnError: boolean;
  private submitFields: string[];

  constructor(
    jwt: any,
    origin: any,
    componentIds: [],
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[]
  ) {
    super(jwt, origin, componentIds, styles);
    this.submitOnSuccess = submitOnSuccess;
    this.submitOnError = submitOnError;
    this.submitFields = submitFields;
    this.messageBus = new MessageBus(origin);
    this._onInit();
  }

  /**
   * Defines form elements for notifications and control frame
   */
  public setElementsFields() {
    const elements = [];
    if (this.shouldLoadNotificationFrame()) {
      elements.push(this.componentIds.notificationFrame);
    }
    elements.push(Selectors.MERCHANT_FORM_SELECTOR); // Control frame is always needed so just append to form
    return elements;
  }

  public _onInit() {
    this.initFormFields();
    this._setMerchantInputListeners();
    this._setTransactionCompleteListener();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }
  /**
   * Inits necessary fields - notification and control frame
   */
  public initFormFields() {
    this.notificationFrame = new Element();
    this.controlFrame = new Element();
    if (this.shouldLoadNotificationFrame()) {
      this.notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles, this.params);
      this.notificationFrameMounted = this.notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME);
      this.elementsToRegister.push(this.notificationFrameMounted);
    }

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
      if (fields[index]) {
        itemToChange.appendChild(fields[index]);
      }
    });
  }

  private shouldLoadNotificationFrame() {
    return !(this.submitOnError && this.submitOnSuccess);
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

  private onTransactionComplete(data: any) {
    if (
      (this.submitOnSuccess &&
        data.errorcode === '0' &&
        ['AUTH', 'CACHETOKENISE'].includes(data.requesttypedescription)) ||
      (this.submitOnError && data.errorcode !== '0')
    ) {
      const form: HTMLFormElement = document.getElementById(Selectors.MERCHANT_FORM_SELECTOR) as HTMLFormElement;
      DomMethods.addDataToForm(form, data, this.submitFields);
      form.submit();
    }
  }

  private _setTransactionCompleteListener() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: any) => {
      this.onTransactionComplete(data);
    });
  }
}

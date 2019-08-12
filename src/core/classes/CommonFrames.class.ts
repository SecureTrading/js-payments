import Element from '../Element';
import { CardinalCommerce } from '../integrations/CardinalCommerce';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';
import RegisterFrames from './RegisterFrames.class';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
class CommonFrames extends RegisterFrames {
  get requestTypes(): string[] {
    return this._requestTypes;
  }

  set requestTypes(requestTypes: string[]) {
    this._requestTypes = requestTypes;
  }

  private static readonly COMPLETED_REQUEST_TYPES = ['AUTH', 'CACHETOKENISE'];
  public elementsTargets: any;
  public elementsToRegister: HTMLElement[];
  private _controlFrame: Element;
  private _controlFrameMounted: HTMLElement;
  private _messageBus: MessageBus;
  private _notificationFrame: Element;
  private _notificationFrameMounted: HTMLElement;
  private _requestTypes: string[];
  private readonly _gatewayUrl: string;
  private readonly _merchantForm: HTMLFormElement;
  private readonly _submitCallback: any;
  private readonly _submitFields: string[];
  private readonly _submitOnError: boolean;
  private readonly _submitOnSuccess: boolean;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[],
    gatewayUrl: string,
    animatedCard: boolean,
    submitCallback: any
  ) {
    super(jwt, origin, componentIds, styles, animatedCard, submitCallback);
    this._gatewayUrl = gatewayUrl;
    this._messageBus = new MessageBus(origin);
    this._merchantForm = document.getElementById(Selectors.MERCHANT_FORM_SELECTOR) as HTMLFormElement;
    this._submitCallback = submitCallback;
    this._submitFields = submitFields;
    this._submitOnError = submitOnError;
    this._submitOnSuccess = submitOnSuccess;
    this.onInit();
  }

  /**
   * Gathers and launches methods needed on initializing object.
   */
  protected onInit() {
    this._initFormFields();
    this._setMerchantInputListeners();
    this._setTransactionCompleteListener();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  protected registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      if (fields[index]) {
        itemToChange.appendChild(fields[index]);
      }
    });
  }

  /**
   * Defines form elements for notifications and control frame
   */
  protected setElementsFields() {
    const elements = [];
    if (this._shouldLoadNotificationFrame()) {
      elements.push(this.componentIds.notificationFrame);
    }
    elements.push(Selectors.MERCHANT_FORM_SELECTOR); // Control frame is always needed so just append to form
    return elements;
  }

  /**
   * Gets all fields which are needed to be submitted.
   * @param data
   * @private
   */
  private _getSubmitFields(data: any) {
    const fields = this._submitFields;
    if (data.hasOwnProperty('jwt') && fields.indexOf('jwt') === -1) {
      fields.push('jwt');
    }
    if (data.hasOwnProperty('threedresponse') && fields.indexOf('threedresponse') === -1) {
      fields.push('threedresponse');
    }
    return fields;
  }

  /**
   * Inits necessary fields - notification and control frame
   */
  private _initFormFields() {
    this._notificationFrame = new Element();
    this._controlFrame = new Element();
    if (this._shouldLoadNotificationFrame()) {
      this._notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles, this.params);
      this._notificationFrameMounted = this._notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME, '-1');
      this.elementsToRegister.push(this._notificationFrameMounted);
    }
    this._controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles, {
      gatewayUrl: this._gatewayUrl,
      jwt: this.jwt,
      origin: this.origin
    });
    this._controlFrameMounted = this._controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME, '-1');
    this.elementsToRegister.push(this._controlFrameMounted);
  }

  /**
   * Checks enrolled ( _isCardEnrolledAndNotFrictionless ) card with request type and returns boolean.
   * @param data
   * @private
   */
  private _isThreedComplete(data: any): boolean {
    if (this.requestTypes[this.requestTypes.length - 1] === 'THREEDQUERY') {
      return (
        // @ts-ignore
        (!CardinalCommerce._isCardEnrolledAndNotFrictionless(data) && data.requesttypedescription === 'THREEDQUERY') ||
        data.threedresponse !== undefined
      );
    }
    return false;
  }

  /**
   * Calls _isThreedComplete if transaction is completed with specified request type.
   * @param data
   * @private
   */
  private _isTransactionFinished(data: any): boolean {
    if (CommonFrames.COMPLETED_REQUEST_TYPES.includes(data.requesttypedescription)) {
      return true;
    } else if (this._isThreedComplete(data)) {
      return true;
    }
    return false;
  }

  /**
   * Publishes merchant input event to MessageBus each time when 'input' event on form field has been called.
   * See _setMerchantInputListeners.
   * @param event
   */
  private _onInput(event: Event) {
    const messageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  /**
   * Function which is triggered each time transaction has been completed.
   * It calls submitCallback specified (or not by merchant) and submits or not
   * (also specified by merchant) form as well.
   * @param data
   * @private
   */
  private _onTransactionComplete(data: any) {
    if ((this._isTransactionFinished(data) || data.errorcode !== '0') && this._submitCallback) {
      this._submitCallback(data);
    }
    if (this._shouldSubmitForm(data)) {
      const form = this._merchantForm;
      DomMethods.addDataToForm(form, data, this._getSubmitFields(data));
      form.submit();
    }
  }

  /**
   * Sets listeners to each merchants form inputs (for validation purposes).
   * @private
   */
  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this._merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  /**
   * Sets listener fo TRANSACTION_COMPLETE event.
   * @private
   */
  private _setTransactionCompleteListener() {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: any) => {
      this._onTransactionComplete(data);
    });
  }

  /**
   * Toggling notification frame.
   * @private
   */
  private _shouldLoadNotificationFrame(): boolean {
    return !(this._submitOnError && this._submitOnSuccess);
  }

  /**
   * Checks if form should be submitted - by checking _submitOnSuccess or _submitOnError and responses status.
   * @param data
   * @private
   */
  private _shouldSubmitForm(data: any): boolean {
    return (
      (this._submitOnSuccess && data.errorcode === '0' && this._isTransactionFinished(data)) ||
      (this._submitOnError && data.errorcode !== '0')
    );
  }
}

export default CommonFrames;

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
export default class CommonFrames extends RegisterFrames {
  get merchantForm(): any {
    return document.getElementById(Selectors.MERCHANT_FORM_SELECTOR);
  }

  set requestTypes(requestTypes: string[]) {
    this._requestTypes = requestTypes;
  }

  get requestTypes(): string[] {
    return this._requestTypes;
  }
  private static readonly COMPLETED_REQUEST_TYPES = ['AUTH', 'CACHETOKENISE'];
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  private _notificationFrameMounted: HTMLElement;
  private _controlFrameMounted: HTMLElement;
  private _notificationFrame: Element;
  private _controlFrame: Element;
  private _messageBus: MessageBus;
  private _requestTypes: string[];
  private readonly _submitOnSuccess: boolean;
  private readonly _submitOnError: boolean;
  private readonly _submitFields: string[];
  private readonly _gatewayUrl: string;

  constructor(
    jwt: any,
    origin: any,
    componentIds: {},
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[],
    gatewayUrl: string
  ) {
    super(jwt, origin, componentIds, styles);
    this._submitOnSuccess = submitOnSuccess;
    this._submitOnError = submitOnError;
    this._submitFields = submitFields;
    this._gatewayUrl = gatewayUrl;
    this._messageBus = new MessageBus(origin);
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
      elements.push(this.componentIds._notificationFrame);
    }
    elements.push(Selectors.MERCHANT_FORM_SELECTOR); // Control frame is always needed so just append to form
    return elements;
  }

  /**
   *
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
   *
   * @param data
   * @private
   */
  private _isThreedComplete(data: any) {
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
   *
   * @param data
   * @private
   */
  private _isTransactionFinished(data: any) {
    if (CommonFrames.COMPLETED_REQUEST_TYPES.includes(data.requesttypedescription)) {
      return true;
    } else if (this._isThreedComplete(data)) {
      return true;
    }
    return false;
  }

  /**
   *
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
   *
   * @param data
   * @private
   */
  private _onTransactionComplete(data: any) {
    if (this._shouldSubmitForm(data)) {
      const form = this.merchantForm;
      DomMethods.addDataToForm(form, data, this._getSubmitFields(data));
      form.submit();
    }
  }

  /**
   *
   * @private
   */
  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this.merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  /**
   *
   * @private
   */
  private _setTransactionCompleteListener() {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: any) => {
      this._onTransactionComplete(data);
    });
  }

  /**
   *
   * @private
   */
  private _shouldLoadNotificationFrame() {
    return !(this._submitOnError && this._submitOnSuccess);
  }

  /**
   *
   * @param data
   * @private
   */
  private _shouldSubmitForm(data: any) {
    return (
      (this._submitOnSuccess && data.errorcode === '0' && this._isTransactionFinished(data)) ||
      (this._submitOnError && data.errorcode !== '0')
    );
  }
}

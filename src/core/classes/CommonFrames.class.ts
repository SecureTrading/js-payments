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
  private readonly _merchantForm: HTMLFormElement;
  private readonly _submitOnSuccess: boolean;
  private readonly _submitOnError: boolean;
  private readonly _submitFields: string[];
  private readonly _gatewayUrl: string;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[],
    gatewayUrl: string,
    animatedCard: boolean
  ) {
    super(jwt, origin, componentIds, styles, animatedCard);
    this._submitOnSuccess = submitOnSuccess;
    this._submitOnError = submitOnError;
    this._submitFields = submitFields;
    this._gatewayUrl = gatewayUrl;
    this._messageBus = new MessageBus(origin);
    this._merchantForm = document.getElementById(Selectors.MERCHANT_FORM_SELECTOR) as HTMLFormElement;
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
   * _getSubmitFields
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
    const { defaultStyles } = this.styles;
    let { notificationFrame, controlFrame } = this.styles;

    notificationFrame = Object.assign({}, defaultStyles, notificationFrame);
    controlFrame = Object.assign({}, defaultStyles, controlFrame);

    this._notificationFrame = new Element();
    this._controlFrame = new Element();
    if (this._shouldLoadNotificationFrame()) {
      this._notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, notificationFrame, this.params);
      this._notificationFrameMounted = this._notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME, '-1');
      this.elementsToRegister.push(this._notificationFrameMounted);
    }
    this._controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, controlFrame, {
      gatewayUrl: this._gatewayUrl,
      jwt: this.jwt,
      origin: this.origin
    });
    this._controlFrameMounted = this._controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME, '-1');
    this.elementsToRegister.push(this._controlFrameMounted);
  }

  /**
   * _isThreedComplete
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
   * _isTransactionFinished
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
   * _onInput
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
   * _onTransactionComplete
   * @param data
   * @private
   */
  private _onTransactionComplete(data: any) {
    if (this._shouldSubmitForm(data)) {
      const form = this._merchantForm;
      DomMethods.addDataToForm(form, data, this._getSubmitFields(data));
      form.submit();
    }
  }

  /**
   * _setMerchantInputListeners
   * @private
   */
  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this._merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  /**
   * _setTransactionCompleteListener
   * @private
   */
  private _setTransactionCompleteListener() {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: any) => {
      this._onTransactionComplete(data);
    });
  }

  /**
   * _shouldLoadNotificationFrame
   * @private
   */
  private _shouldLoadNotificationFrame() {
    return !(this._submitOnError && this._submitOnSuccess);
  }

  /**
   * _shouldSubmitForm
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

export default CommonFrames;

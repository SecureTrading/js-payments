import { CardinalCommerce } from '../integrations/CardinalCommerce';
import { IResponseData } from '../models/IResponseData';
import { IStyles } from '../models/IStyles';
import { Element } from '../services/Element';
import { DomMethods } from '../shared/DomMethods';
import { MessageBus } from '../shared/MessageBus';
import { Selectors } from '../shared/Selectors';
import { Validation } from '../shared/Validation';
import { RegisterFrames } from './RegisterFrames.class';

export class CommonFrames extends RegisterFrames {
  get requestTypes(): string[] {
    return this._requestTypes;
  }

  set requestTypes(requestTypes: string[]) {
    this._requestTypes = requestTypes;
  }

  private static readonly COMPLETED_REQUEST_TYPES: string[] = ['AUTH', 'CACHETOKENISE', 'ACCOUNTCHECK'];
  public elementsTargets: string[];
  public elementsToRegister: HTMLElement[];
  private _controlFrame: Element;
  private _controlFrameMounted: HTMLElement;
  private _messageBus: MessageBus;
  private _notificationFrame: Element;
  private _notificationFrameMounted: HTMLElement;
  private _requestTypes: string[];
  private _validation: Validation;
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
    submitCallback: void,
    fieldsToSubmit: string[],
    requestTypes: string[]
  ) {
    super(jwt, origin, componentIds, styles, animatedCard, fieldsToSubmit, submitCallback);
    this._gatewayUrl = gatewayUrl;
    this._messageBus = new MessageBus(origin);
    this._merchantForm = document.getElementById(Selectors.MERCHANT_FORM_SELECTOR) as HTMLFormElement;
    this._validation = new Validation();
    this._submitCallback = submitCallback;
    this._submitFields = submitFields;
    this._submitOnError = submitOnError;
    this._submitOnSuccess = submitOnSuccess;
    this._requestTypes = requestTypes;
  }

  public init(): void {
    this._initFormFields();
    this._setMerchantInputListeners();
    this._setTransactionCompleteListener();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  protected registerElements(fields: HTMLElement[], targets: string[]): void {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      if (fields[index]) {
        itemToChange.appendChild(fields[index]);
      }
    });
  }

  protected setElementsFields(): string[] {
    const elements: string[] = [];
    if (this._shouldLoadNotificationFrame()) {
      elements.push(this.componentIds.notificationFrame);
    }
    elements.push(Selectors.MERCHANT_FORM_SELECTOR);
    return elements;
  }

  private _getSubmitFields(data: IResponseData): string[] {
    const fields = this._submitFields;
    if (data.hasOwnProperty('jwt') && fields.indexOf('jwt') === -1) {
      fields.push('jwt');
    }
    if (data.hasOwnProperty('threedresponse') && fields.indexOf('threedresponse') === -1) {
      fields.push('threedresponse');
    }
    return fields;
  }

  private _initFormFields(): void {
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

  private _isThreedComplete(data: IResponseData): boolean {
    if (this.requestTypes[this.requestTypes.length - 1] === 'THREEDQUERY') {
      // @ts-ignore
      return (
        (!CardinalCommerce.isCardEnrolledAndNotFrictionless(data) && data.requesttypedescription === 'THREEDQUERY') ||
        data.threedresponse !== undefined
      );
    }
    return false;
  }

  private _isTransactionFinished(data: IResponseData): boolean {
    return CommonFrames.COMPLETED_REQUEST_TYPES.includes(data.requesttypedescription) || this._isThreedComplete(data)
      ? true
      : false;
  }

  private _onInput(): void {
    const messageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _onTransactionComplete(data: IResponseData): void {
    if ((this._isTransactionFinished(data) || data.errorcode !== '0') && typeof this._submitCallback === 'function') {
      this._validation.blockForm(false);
      this._submitCallback(data);
    }
    if (this._shouldSubmitForm(data)) {
      const form = this._merchantForm;
      DomMethods.addDataToForm(form, data, this._getSubmitFields(data));
      form.submit();
    }
  }

  private _setMerchantInputListeners(): void {
    const els = DomMethods.getAllFormElements(this._merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  private _setTransactionCompleteListener(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: IResponseData) => {
      if (this._isPaymentNotApplePay(data.walletsource)) {
        this._onTransactionComplete(data);
        return;
      }
      const localStore = localStorage.getItem('completePayment');
      setTimeout(() => {
        if (localStore === 'true') {
          this._onTransactionComplete(data);
        }
      }, 3000);
    });
  }

  private _shouldLoadNotificationFrame(): boolean {
    return !(this._submitOnError && this._submitOnSuccess);
  }

  private _isPaymentNotApplePay(walletsource: string): boolean {
    return walletsource !== 'APPLEPAY';
  }

  private _shouldSubmitForm(data: IResponseData): boolean {
    return (
      (this._submitOnSuccess && data.errorcode === '0' && this._isTransactionFinished(data)) ||
      (this._submitOnError && data.errorcode !== '0')
    );
  }
}

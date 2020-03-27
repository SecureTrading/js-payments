import { CardinalCommerce } from '../integrations/CardinalCommerce';
import { IStyles } from '../config/model/IStyles';
import { Element } from '../services/Element';
import { DomMethods } from '../shared/DomMethods';
import { MessageBus } from '../shared/MessageBus';
import { Selectors } from '../shared/Selectors';
import { Validation } from '../shared/Validation';
import { RegisterFrames } from './RegisterFrames.class';
import { BrowserLocalStorage } from '../services/storage/BrowserLocalStorage';
import { Container } from 'typedi';
import { IComponentsIds } from '../config/model/IComponentsIds';

export class CommonFrames extends RegisterFrames {
  get requestTypes(): string[] {
    return this._requestTypes;
  }

  set requestTypes(requestTypes: string[]) {
    this._requestTypes = requestTypes;
  }

  private static readonly COMPLETED_REQUEST_TYPES = ['AUTH', 'CACHETOKENISE', 'ACCOUNTCHECK'];
  public elementsTargets: any;
  public elementsToRegister: HTMLElement[];
  private _controlFrame: Element;
  private _controlFrameMounted: HTMLElement;
  private _messageBus: MessageBus;
  private _notificationFrame: Element;
  private _requestTypes: string[];
  private readonly _gatewayUrl: string;
  private readonly _merchantForm: HTMLFormElement;
  private _validation: Validation;
  private readonly _submitFields: string[];
  private readonly _submitOnError: boolean;
  private readonly _submitOnSuccess: boolean;
  private _localStorage: BrowserLocalStorage = Container.get(BrowserLocalStorage);

  constructor(
    jwt: string,
    origin: string,
    componentIds: IComponentsIds,
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[],
    gatewayUrl: string,
    animatedCard: boolean,
    requestTypes: string[]
  ) {
    super(jwt, origin, componentIds, styles, animatedCard);
    this._gatewayUrl = gatewayUrl;
    this._messageBus = Container.get(MessageBus);
    this._merchantForm = document.getElementById(Selectors.MERCHANT_FORM_SELECTOR) as HTMLFormElement;
    this._validation = new Validation();
    this._submitFields = submitFields;
    this._submitOnError = submitOnError;
    this._submitOnSuccess = submitOnSuccess;
    this._requestTypes = requestTypes;
  }

  public init() {
    this._initFormFields();
    this._setMerchantInputListeners();
    this._setTransactionCompleteListener();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  protected registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      if (fields[index]) {
        itemToChange.appendChild(fields[index]);
      }
    });
  }

  protected setElementsFields() {
    const elements = [];
    elements.push(Selectors.MERCHANT_FORM_SELECTOR);
    return elements;
  }

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

  private _initFormFields() {
    const { defaultStyles } = this.styles;
    let { controlFrame } = this.styles;

    controlFrame = Object.assign({}, defaultStyles, controlFrame);

    this._notificationFrame = new Element();
    this._controlFrame = new Element();
    this._controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, controlFrame, {
      gatewayUrl: this._gatewayUrl,
      jwt: this.jwt,
      origin: this.origin
    });
    this._controlFrameMounted = this._controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME, '-1');
    this.elementsToRegister.push(this._controlFrameMounted);
  }

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

  private _isTransactionFinished(data: any): boolean {
    if (CommonFrames.COMPLETED_REQUEST_TYPES.includes(data.requesttypedescription)) {
      return true;
    } else if (this._isThreedComplete(data)) {
      return true;
    }
    return false;
  }

  private _onInput(event: Event) {
    const messageBusEvent = {
      data: DomMethods.parseForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _onTransactionComplete(data: any) {
    if (this._isTransactionFinished(data) || data.errorcode !== '0') {
      this._messageBus.publish({ data, type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUBMIT_CALLBACK }, true);
    }
    if (this._shouldSubmitForm(data)) {
      const form = this._merchantForm;
      DomMethods.addDataToForm(form, data, this._getSubmitFields(data));
      form.submit();
    }
  }

  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this._merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  private _setTransactionCompleteListener() {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: any) => {
      if (data.walletsource === 'APPLEPAY') {
        const localStore = this._localStorage.getItem('completePayment');
        setTimeout(() => {
          if (localStore === 'true') {
            this._onTransactionComplete(data);
          }
        }, 3000);
      } else {
        this._onTransactionComplete(data);
      }
    });
  }

  private _shouldSubmitForm(data: any): boolean {
    return (
      (this._submitOnSuccess && data.errorcode === '0' && this._isTransactionFinished(data)) ||
      (this._submitOnError && data.errorcode !== '0')
    );
  }
}

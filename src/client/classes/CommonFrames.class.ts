import { IStyles } from '../../shared/model/config/IStyles';
import { Element } from './Element';
import { DomMethods } from '../../application/core/shared/DomMethods';
import { MessageBus } from '../../application/core/shared/MessageBus';
import { Selectors } from '../../application/core/shared/Selectors';
import { Validation } from '../../application/core/shared/Validation';
import { RegisterFrames } from './RegisterFrames.class';
import { Container } from 'typedi';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { Language } from '../../application/core/shared/Language';
import { filter, first, delay, map, takeUntil } from 'rxjs/operators';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { Observable } from 'rxjs';
import { PUBLIC_EVENTS } from '../../application/core/shared/EventTypes';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';

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
  private _formSubmitted: boolean;
  private readonly _submitFields: string[];
  private readonly _submitOnError: boolean;
  private readonly _submitOnSuccess: boolean;
  private readonly _submitOnCancel: boolean;
  private _localStorage: BrowserLocalStorage = Container.get(BrowserLocalStorage);
  private _destroy$: Observable<IMessageBusEvent>;

  constructor(
    jwt: string,
    origin: string,
    componentIds: IComponentsIds,
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitOnCancel: boolean,
    submitFields: string[],
    gatewayUrl: string,
    animatedCard: boolean,
    requestTypes: string[],
    formId: string
  ) {
    super(jwt, origin, componentIds, styles, animatedCard, formId);
    this._gatewayUrl = gatewayUrl;
    this._messageBus = Container.get(MessageBus);
    this.formId = formId;
    this._merchantForm = document.getElementById(formId) as HTMLFormElement;
    this._validation = new Validation();
    this._formSubmitted = false;
    this._submitFields = submitFields;
    this._submitOnError = submitOnError;
    this._submitOnCancel = submitOnCancel;
    this._submitOnSuccess = submitOnSuccess;
    this._requestTypes = requestTypes;
    this._destroy$ = this._messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
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
    elements.push(this.formId);
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
      const isCardEnrolledAndNotFrictionless = data.enrolled === 'Y' && data.acsurl !== undefined;

      return (
        (!isCardEnrolledAndNotFrictionless && data.requesttypedescription === 'THREEDQUERY') ||
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
      data: DomMethods.parseForm(this.formId),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _onTransactionComplete(data: any): void {
    if (this._isTransactionFinished(data) || data.errorcode !== '0') {
      this._messageBus.publish({ data, type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUBMIT_CALLBACK }, true);
    }

    if (this._isTransactionFinished(data) && data.errorcode === '0') {
      data = Object.assign(data, { errormessage: Language.translations.PAYMENT_SUCCESS });
      if (this._submitOnSuccess) {
        this._submitForm(data);
      }
      return;
    }

    if (data.errorcode === 'cancelled') {
      data = Object.assign(data, { errormessage: Language.translations.PAYMENT_CANCELLED });
      if (this._submitOnCancel) {
        this._submitForm(data);
      }
      return;
    }

    if (data.errorcode !== '0') {
      data = Object.assign(data, { errormessage: data.errormessage });
      if (this._submitOnError) {
        this._submitForm(data);
      }
      return;
    }
  }

  private _submitForm(data: any) {
    if (!this._formSubmitted) {
      this._formSubmitted = true;
      DomMethods.addDataToForm(this._merchantForm, data, this._getSubmitFields(data));
      this._merchantForm.submit();
    }
  }

  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this._merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  private _setTransactionCompleteListener() {
    this._messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE),
        map(event => event.data),
        takeUntil(this._destroy$)
      )
      .subscribe((data: any) => {
        if (data.walletsource !== 'APPLEPAY') {
          this._onTransactionComplete(data);
          return;
        }

        this._localStorage
          .select(store => store.completePayment)
          .pipe(
            filter((value: string) => value === 'true'),
            first(),
            delay(4000)
          )
          .subscribe(() => this._onTransactionComplete(data));
      });
  }
}

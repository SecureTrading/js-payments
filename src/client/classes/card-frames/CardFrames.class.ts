import JwtDecode from 'jwt-decode';
import { FormState } from '../../../application/core/models/constants/FormState';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IStyles } from '../../../shared/model/config/IStyles';
import { IValidationMessageBus } from '../../../application/core/models/IValidationMessageBus';
import { IframeFactory } from '../element/IframeFactory';
import { DomMethods } from '../../../application/core/shared/DomMethods';
import { Language } from '../../../application/core/shared/Language';
import { MessageBus } from '../../../application/core/shared/MessageBus';
import { Selectors } from '../../../application/core/shared/Selectors';
import { Translator } from '../../../application/core/shared/Translator';
import { Validation } from '../../../application/core/shared/Validation';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { Observable } from 'rxjs';
import { ConfigProvider } from '../../../shared/services/config/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { PUBLIC_EVENTS } from '../../../application/core/shared/EventTypes';
import { first } from 'rxjs/operators';
import { Frame } from '../../../application/core/shared/frame/Frame';
import { StJwt } from '../../../application/core/shared/StJwt';
import { IStJwtObj } from '../../../application/core/models/IStJwtObj';

export class CardFrames {
  private static CARD_NUMBER_FIELD_NAME: string = 'pan';
  private static CLICK_EVENT: string = 'click';
  private static COMPLETE_FORM_NUMBER_OF_FIELDS: number = 3;
  private static EXPIRY_DATE_FIELD_NAME: string = 'expirydate';
  private static INPUT_EVENT: string = 'input';
  private static NO_CVV_CARDS: string[] = ['PIBA'];
  private static ONLY_CVV_NUMBER_OF_FIELDS: number = 1;
  private static SUBMIT_EVENT: string = 'submit';
  private static SECURITY_CODE_FIELD_NAME: string = 'securitycode';
  private static SUBMIT_BUTTON_AS_BUTTON_MARKUP: string = 'button[type="submit"]';
  private static SUBMIT_BUTTON_AS_INPUT_MARKUP: string = 'input[type="submit"]';
  private static SUBMIT_BUTTON_DISABLED_CLASS: string = 'st-button-submit__disabled';

  private _animatedCard: HTMLIFrameElement;
  private _cardNumber: HTMLIFrameElement;
  private _expirationDate: HTMLIFrameElement;
  private _securityCode: HTMLIFrameElement;
  private _validation: Validation;
  private _translator: Translator;
  private _messageBusEvent: IMessageBusEvent = { data: { message: '' }, type: '' };
  private _submitButton: HTMLInputElement | HTMLButtonElement;
  private _buttonId: string;
  private _defaultPaymentType: string;
  private _paymentTypes: string[];
  private _payMessage: string;
  private _processingMessage: string;
  private _fieldsToSubmitLength: number;
  private _isCardWithNoCvv: boolean;
  private _noFieldConfiguration: boolean;
  private _onlyCvvConfiguration: boolean;
  private _configurationForStandardCard: boolean;
  private _loadAnimatedCard: boolean;
  private _config$: Observable<IConfig>;
  protected styles: IStyles;
  protected params: any;
  protected elementsToRegister: HTMLElement[];
  protected elementsTargets: string[];
  protected jwt: string;
  protected origin: string;
  protected componentIds: any;
  protected submitCallback: any;
  protected fieldsToSubmit: string[];
  protected messageBus: MessageBus;
  protected formId: string;
  private _stJwt: StJwt;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    paymentTypes: string[],
    defaultPaymentType: string,
    animatedCard: boolean,
    buttonId: string,
    fieldsToSubmit: string[],
    formId: string,
    private _configProvider: ConfigProvider,
    private _iframeFactory: IframeFactory,
    private _frame: Frame,
    private _messageBus: MessageBus
  ) {
    this.fieldsToSubmit = fieldsToSubmit || ['pan', 'expirydate', 'securitycode'];
    this.elementsToRegister = [];
    this.componentIds = componentIds;
    this.formId = formId;
    this.jwt = jwt;
    this.origin = origin;
    this.styles = this._getStyles(styles);
    this._stJwt = new StJwt(jwt);
    this.params = { locale: this._stJwt.locale, origin: this.origin };
    this._config$ = this._configProvider.getConfig$();
    this._setInitValues(buttonId, defaultPaymentType, paymentTypes, animatedCard, jwt, formId);
    this.configureFormFieldsAmount(jwt);
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON, () => {
      this._disableSubmitButton(FormState.AVAILABLE);
    });
    this.styles = this._getStyles(styles);
  }

  public init() {
    this._preventFormSubmit();
    this._createSubmitButton();
    this._initSubscribes();
    this._initCardFrames();
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  private _getStyles(styles: any) {
    for (const key in styles) {
      if (styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }

  protected configureFormFieldsAmount(jwt: string): void {
    this._fieldsToSubmitLength = this.fieldsToSubmit.length;
    this._isCardWithNoCvv = jwt && CardFrames.NO_CVV_CARDS.includes(this._getCardType(jwt));
    this._noFieldConfiguration =
      this._fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this._onlyCvvConfiguration =
      this._fieldsToSubmitLength === CardFrames.ONLY_CVV_NUMBER_OF_FIELDS &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
    this._configurationForStandardCard =
      this._fieldsToSubmitLength === CardFrames.COMPLETE_FORM_NUMBER_OF_FIELDS &&
      this._loadAnimatedCard &&
      !this._isCardWithNoCvv &&
      this.fieldsToSubmit.includes(CardFrames.CARD_NUMBER_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.EXPIRY_DATE_FIELD_NAME) &&
      this.fieldsToSubmit.includes(CardFrames.SECURITY_CODE_FIELD_NAME);
  }

  protected registerElements(fields: HTMLElement[], targets: string[]): void {
    if (fields.length === targets.length) {
      targets.forEach((item, index) => {
        const element: HTMLElement = document.getElementById(item);
        if (element !== null) {
          element.appendChild(fields[index]);
        }
      });
    }
  }

  protected setElementsFields(): string[] {
    if (this._configurationForStandardCard) {
      return [
        this.componentIds.cardNumber,
        this.componentIds.expirationDate,
        this.componentIds.securityCode,
        this.componentIds.animatedCard
      ];
    } else if (this._onlyCvvConfiguration) {
      return [this.componentIds.securityCode];
    } else if (this._noFieldConfiguration) {
      return [];
    } else {
      return [
        this.componentIds.cardNumber, //
        this.componentIds.expirationDate,
        this.componentIds.securityCode
      ];
    }
  }

  private _createSubmitButton = (): HTMLInputElement | HTMLButtonElement => {
    const form = document.getElementById(this.formId);

    this._submitButton =
      (document.getElementById(this._buttonId) as HTMLInputElement | HTMLButtonElement) ||
      form.querySelector(CardFrames.SUBMIT_BUTTON_AS_BUTTON_MARKUP) ||
      form.querySelector(CardFrames.SUBMIT_BUTTON_AS_INPUT_MARKUP);
    this._disableSubmitButton(FormState.LOADING);

    this._config$.subscribe(response => {
      const { deferInit, components } = response;

      if (this._submitButton) {
        this._submitButton.textContent = this._payMessage;
      }

      if (deferInit || components.startOnLoad) {
        this._disableSubmitButton(FormState.AVAILABLE);
      }
    });

    return this._submitButton;
  };

  private _disableFormField(state: FormState, eventName: string, target: string): void {
    const messageBusEvent: IMessageBusEvent = {
      data: state,
      type: eventName
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _disableSubmitButton(state: FormState): void {
    if (this._submitButton) {
      this._setSubmitButtonProperties(this._submitButton, state);
    }
  }

  private _getCardType(jwt: string): string {
    const cardDetails = JwtDecode(jwt) as any;
    if (cardDetails.payload.pan) {
      return iinLookup.lookup(cardDetails.payload.pan).type;
    }
  }

  private _initCardNumberFrame(styles: {}): void {
    this._cardNumber = this._iframeFactory.create(
      Selectors.CARD_NUMBER_COMPONENT_NAME,
      Selectors.CARD_NUMBER_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this._cardNumber);
  }

  private _initExpiryDateFrame(styles: {}): void {
    this._expirationDate = this._iframeFactory.create(
      Selectors.EXPIRATION_DATE_COMPONENT_NAME,
      Selectors.EXPIRATION_DATE_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this._expirationDate);
  }

  private _initSecurityCodeFrame(styles: {}): void {
    this._securityCode = this._iframeFactory.create(
      Selectors.SECURITY_CODE_COMPONENT_NAME,
      Selectors.SECURITY_CODE_IFRAME,
      styles,
      this.params
    );
    this.elementsToRegister.push(this._securityCode);
  }

  private _initAnimatedCardFrame(): void {
    const animatedCardConfig = { ...this.params };
    if (this._paymentTypes !== undefined) {
      animatedCardConfig.paymentTypes = this._paymentTypes;
    }
    if (this._defaultPaymentType !== undefined) {
      animatedCardConfig.defaultPaymentType = this._defaultPaymentType;
    }
    this._animatedCard = this._iframeFactory.create(
      Selectors.ANIMATED_CARD_COMPONENT_NAME,
      Selectors.ANIMATED_CARD_COMPONENT_IFRAME,
      {},
      animatedCardConfig,
      -1
    );
    this.elementsToRegister.push(this._animatedCard);
  }

  private _initCardFrames(): void {
    const { defaultStyles } = this.styles;
    let { cardNumber, securityCode, expirationDate } = this.styles;
    cardNumber = Object.assign({}, defaultStyles, cardNumber);
    securityCode = Object.assign({}, defaultStyles, securityCode);
    expirationDate = Object.assign({}, defaultStyles, expirationDate);
    if (this._onlyCvvConfiguration) {
      this._initSecurityCodeFrame(securityCode);
    } else if (this._configurationForStandardCard) {
      this._initCardNumberFrame(cardNumber);
      this._initExpiryDateFrame(expirationDate);
      this._initSecurityCodeFrame(securityCode);
      this._initAnimatedCardFrame();
    } else {
      this._initCardNumberFrame(cardNumber);
      this._initExpiryDateFrame(expirationDate);
      this._initSecurityCodeFrame(securityCode);
    }
  }

  private _initSubscribes(): void {
    this._submitFormListener();
    this._subscribeBlockSubmit();
    this._validateFieldsAfterSubmit();
    this._setMerchantInputListeners();
  }

  private _onInput(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: DomMethods.parseForm(this.formId),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _publishSubmitEvent(): void {
    const messageBusEvent: IMessageBusEvent = {
      data: {
        fieldsToSubmit: this.fieldsToSubmit
      },
      type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
    };
    this._messageBus.publish(messageBusEvent, true);
  }

  private _publishValidatedFieldState(field: { message: string; state: boolean }, eventType: string): void {
    this._messageBusEvent.type = eventType;
    this._messageBusEvent.data.message = field.message;
    this._messageBus.publish(this._messageBusEvent);
  }

  private _setMerchantInputListeners(): void {
    const els = DomMethods.getAllFormElements(document.getElementById(this.formId));
    for (const el of els) {
      el.addEventListener(CardFrames.INPUT_EVENT, this._onInput.bind(this));
    }
  }

  private _setInitValues(
    buttonId: string,
    defaultPaymentType: string,
    paymentTypes: any,
    loadAnimatedCard: boolean,
    jwt: string,
    formId: string
  ): void {
    this._validation = new Validation();
    const locale: string = this._frame.parseUrl().locale || JwtDecode<IStJwtObj>(jwt).payload.locale;
    this._translator = new Translator(locale);
    this._buttonId = buttonId;
    this.formId = formId;
    this._defaultPaymentType = defaultPaymentType;
    this._paymentTypes = paymentTypes;
    this.jwt = jwt;
    this._payMessage = this._translator.translate(Language.translations.PAY);
    this._processingMessage = `${this._translator.translate(Language.translations.PROCESSING)} ...`;
    this._loadAnimatedCard = loadAnimatedCard !== undefined ? loadAnimatedCard : true;
  }

  private _setSubmitButtonProperties(element: any, state: FormState): HTMLElement {
    let disabledState;
    if (state === FormState.BLOCKED) {
      element.textContent = this._processingMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
      disabledState = true;
    } else if (state === FormState.COMPLETE) {
      element.textContent = this._payMessage;
      element.classList.add(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS); // Keep it locked but return it to original text
      disabledState = true;
    } else if (state === FormState.LOADING) {
      element.textContent = this._payMessage;
      disabledState = true;
    } else {
      element.textContent = this._payMessage;
      element.classList.remove(CardFrames.SUBMIT_BUTTON_DISABLED_CLASS);
      disabledState = false;
    }
    element.disabled = disabledState;
    return element;
  }

  private _submitFormListener(): void {
    if (this._submitButton) {
      this._submitButton.addEventListener(CardFrames.CLICK_EVENT, () => {
        this._publishSubmitEvent();
      });
    }
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.CALL_SUBMIT_EVENT, () => {
      this._publishSubmitEvent();
    });
  }

  private _subscribeBlockSubmit(): void {
    this._messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM))
      .subscribe(() => this._disableSubmitButton(FormState.BLOCKED));

    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BLOCK_FORM, (state: FormState) => {
      this._disableSubmitButton(state);
      this._disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_CARD_NUMBER, Selectors.CARD_NUMBER_IFRAME);
      this._disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_EXPIRATION_DATE, Selectors.EXPIRATION_DATE_IFRAME);
      this._disableFormField(state, MessageBus.EVENTS_PUBLIC.BLOCK_SECURITY_CODE, Selectors.SECURITY_CODE_IFRAME);
    });
  }

  private _validateFieldsAfterSubmit(): void {
    this._messageBus.subscribe(MessageBus.EVENTS.VALIDATE_FORM, (data: IValidationMessageBus) => {
      const { cardNumber, expirationDate, securityCode } = data;
      if (!cardNumber.state) {
        this._publishValidatedFieldState(cardNumber, MessageBus.EVENTS.VALIDATE_CARD_NUMBER_FIELD);
      }
      if (!expirationDate.state) {
        this._publishValidatedFieldState(expirationDate, MessageBus.EVENTS.VALIDATE_EXPIRATION_DATE_FIELD);
      }
      if (!securityCode.state) {
        this._publishValidatedFieldState(securityCode, MessageBus.EVENTS.VALIDATE_SECURITY_CODE_FIELD);
      }
    });
  }

  private _preventFormSubmit(): void {
    const preventFunction = (event: Event) => event.preventDefault();
    const paymentForm = document.getElementById(this.formId);

    paymentForm.addEventListener(CardFrames.SUBMIT_EVENT, preventFunction);

    this._messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY), first()).subscribe(() => {
      paymentForm.removeEventListener(CardFrames.SUBMIT_EVENT, preventFunction);
    });
  }
}

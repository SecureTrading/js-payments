import JwtDecode from 'jwt-decode';
import { StCodec } from '../../core/services/StCodec.class';
import { FormFieldsDetails } from '../../core/models/constants/FormFieldsDetails';
import { FormFieldsValidity } from '../../core/models/constants/FormFieldsValidity';
import { FormState } from '../../core/models/constants/FormState';
import { ICard } from '../../core/models/ICard';
import { IDecodedJwt } from '../../core/models/IDecodedJwt';
import { IFormFieldsDetails } from '../../core/models/IFormFieldsDetails';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IFormFieldsValidity } from '../../core/models/IFormFieldsValidity';
import { IMerchantData } from '../../core/models/IMerchantData';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { IResponseData } from '../../core/models/IResponseData';
import { ISubmitData } from '../../core/models/ISubmitData';
import { Frame } from '../../core/shared/Frame';
import { Language } from '../../core/shared/Language';
import { MessageBus } from '../../core/shared/MessageBus';
import { Payment } from '../../core/shared/Payment';
import { Validation } from '../../core/shared/Validation';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { BrowserSessionStorage } from '../../../shared/services/storage/BrowserSessionStorage';
import { Service } from 'typedi';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ConfigProvider } from '../../core/services/ConfigProvider';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { Cybertonica } from '../../core/integrations/Cybertonica';
import { IConfig } from '../../../shared/model/config/IConfig';
import { CardinalCommerce } from '../../core/integrations/cardinal-commerce/CardinalCommerce';
import { ICardinalCommerceTokens } from '../../core/integrations/cardinal-commerce/ICardinalCommerceTokens';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IAuthorizePaymentResponse } from '../../core/models/IAuthorizePaymentResponse';
import { StJwt } from '../../core/shared/StJwt';
import { Translator } from '../../core/shared/Translator';

@Service()
export class ControlFrame extends Frame {
  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];
  private static NON_CVV_CARDS: string[] = ['PIBA'];
  private static THREEDQUERY_EVENT: string = 'THREEDQUERY';

  private static _setFormFieldValidity(field: IFormFieldState, data: IFormFieldState): void {
    field.validity = data.validity;
  }

  private static _setFormFieldValue(field: IFormFieldState, data: IFormFieldState): void {
    field.value = data.value;
  }

  private static _resetJwt(): void {
    StCodec.jwt = StCodec.originalJwt;
  }

  private static _updateJwt(jwt: string): void {
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
  }

  private _card: ICard = {
    pan: '',
    expirydate: '',
    securitycode: ''
  };
  private _isPaymentReady: boolean = false;
  private _formFields: IFormFieldsDetails = FormFieldsDetails;
  private _formFieldsValidity: IFormFieldsValidity = FormFieldsValidity;
  private _merchantFormData: IMerchantData;
  private _payment: Payment;
  private _postThreeDRequestTypes: string[];
  private _preThreeDRequestTypes: string[];
  private _validation: Validation;
  private _config: IConfig;

  constructor(
    private _localStorage: BrowserLocalStorage,
    private _sessionStorage: BrowserSessionStorage,
    private _communicator: InterFrameCommunicator,
    private _configProvider: ConfigProvider,
    private _notification: NotificationService,
    private _cybertonica: Cybertonica,
    private _cardinalCommerce: CardinalCommerce
  ) {
    super();
    const config$ = this._configProvider.getConfig$();
    this._communicator.whenReceive(MessageBus.EVENTS_PUBLIC.CONFIG_CHECK).thenRespond(() => config$);
    config$.subscribe(config => {
      this._config = config;
      this.onInit();
    });
  }

  protected onInit(): void {
    super.onInit();
    this._setInstances();
    this._setFormFieldsValidities();
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_CARD_NUMBER, this._formFields.cardNumber);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, this._formFields.expirationDate);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE, this._formFields.securityCode);
    this._submitFormEvent();
    this._updateMerchantFieldsEvent();
    this._resetJwtEvent();
    this._updateJwtEvent();
    this._initCybertonica();
    this._initCardinalCommerce();

    this.messageBus.subscribe(
      MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
      (tokens: ICardinalCommerceTokens) => {
        this._payment.setCardinalCommerceCacheToken(tokens.cacheToken);
      }
    );
  }

  protected getAllowedParams(): string[] {
    return super.getAllowedParams().concat(ControlFrame.ALLOWED_PARAMS);
  }

  private _formFieldChangeEvent(event: string, field: IFormFieldState): void {
    this.messageBus.subscribe(event, (data: IFormFieldState) => {
      this._formFieldChange(event, data.value);
      ControlFrame._setFormFieldValidity(field, data);
      ControlFrame._setFormFieldValue(field, data);
    });
  }

  private _resetJwtEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.RESET_JWT, () => {
      ControlFrame._resetJwt();
    });
  }

  private _setPreThreeDRequestTypes(): void {
    if (this._isCardBypassed(this._card.pan || this._getPan())) {
      return;
    }
    const threeDIndex = this._config.components.requestTypes.indexOf(ControlFrame.THREEDQUERY_EVENT);
    this._preThreeDRequestTypes = this._config.components.requestTypes.slice(0, threeDIndex + 1);
    console.error('PRE', this._preThreeDRequestTypes);
    console.error('POST', this._postThreeDRequestTypes);
  }

  private _setPostThreeDRequestTypes(): void {
    if (this._isCardBypassed(this._card.pan || this._getPan())) {
      this._postThreeDRequestTypes = this._config.components.requestTypes.filter(
        (request: string) => request !== ControlFrame.THREEDQUERY_EVENT
      );
      console.error('FILTERED REQUESTS:', this._postThreeDRequestTypes);
      return;
    }

    const threeDIndex = this._config.components.requestTypes.indexOf(ControlFrame.THREEDQUERY_EVENT);
    this._postThreeDRequestTypes = this._config.components.requestTypes.slice(
      threeDIndex + 1,
      this._config.components.requestTypes.length
    );
    console.error('PRE', this._preThreeDRequestTypes);
    console.error('POST', this._postThreeDRequestTypes);
  }

  private _updateJwtEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: any) => {
      ControlFrame._updateJwt(data.newJwt);
    });
  }

  private _updateMerchantFieldsEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: IMerchantData) => {
      this._updateMerchantFields(data);
    });
  }

  private _submitFormEvent(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM, (data?: ISubmitData) => {
      const isPanPiba: boolean = this._isCardWithoutCVV();
      const dataInJwt = data ? data.dataInJwt : false;
      const { validity } = this._validation.formValidation(
        dataInJwt,
        data.fieldsToSubmit,
        this._formFields,
        isPanPiba,
        this._isPaymentReady
      );
      if (!validity) {
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._validateFormFields();
        return;
      }
      this._setPostThreeDRequestTypes();

      if (this._isCardBypassed(this._card.pan || this._getPan())) {
        this._processPayment(data as IResponseData);
        return;
      }

      this._callThreeDQueryRequest().subscribe(
        authorizationData => this._processPayment(authorizationData as any),
        errorData => {
          const { ErrorNumber, ErrorDescription } = errorData;
          const translator = new Translator(this._localStorage.getItem('locale'));
          const translatedErrorMessage = translator.translate(Language.translations.PAYMENT_ERROR);

          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.RESET_JWT });
          this.messageBus.publish(
            {
              type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE,
              data: {
                acquirerresponsecode: ErrorNumber ? ErrorNumber.toString() : ErrorNumber,
                acquirerresponsemessage: ErrorDescription,
                errorcode: '50003',
                errormessage: translatedErrorMessage
              }
            },
            true
          );
          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM, data: FormState.AVAILABLE }, true);
          this._notification.error(translatedErrorMessage);
        }
      );
    });
  }

  private _isCardBypassed(pan: string): boolean {
    const bypassCards = this._configProvider.getConfig().bypassCards as string[];

    return bypassCards.includes(iinLookup.lookup(pan).type);
  }

  private _processPayment(data: IResponseData): void {
    console.error('PROCESS PAYMENT:', this._postThreeDRequestTypes, this._card);
    this._payment
      .processPayment(this._postThreeDRequestTypes, this._card, this._merchantFormData, data)
      .then(() => {
        this.messageBus.publish(
          {
            type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK
          },
          true
        );
        this._notification.success(Language.translations.PAYMENT_SUCCESS);
        this._validation.blockForm(FormState.COMPLETE);
      })
      .catch((error: any) => {
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(Language.translations.PAYMENT_ERROR);
        this._validation.blockForm(FormState.AVAILABLE);
      })
      .finally(() => {
        ControlFrame._resetJwt();
      });
  }

  private _isCardWithoutCVV(): boolean {
    const panFromJwt: string = this._getPan();
    let pan: string = '';
    if (panFromJwt || this._formFields.cardNumber.value) {
      pan = panFromJwt ? panFromJwt : this._formFields.cardNumber.value;
    }

    const cardType: string = iinLookup.lookup(pan).type;
    return ControlFrame.NON_CVV_CARDS.includes(cardType);
  }

  private _callThreeDQueryRequest(): Observable<IAuthorizePaymentResponse> {
    const applyCybertonicaTid = (merchantFormData: IMerchantData) =>
      from(this._cybertonica.getTransactionId()).pipe(
        map(cybertonicaTid => {
          if (!cybertonicaTid) {
            return merchantFormData;
          }

          return {
            ...merchantFormData,
            fraudcontroltransactionid: cybertonicaTid
          };
        })
      );
    this._setPreThreeDRequestTypes();
    console.error('CALLING THREEDQUERY:', this._preThreeDRequestTypes);
    return of({ ...this._merchantFormData }).pipe(
      switchMap(applyCybertonicaTid),
      switchMap(merchantFormData =>
        this._cardinalCommerce.performThreeDQuery(this._preThreeDRequestTypes, this._card, merchantFormData)
      )
    );
  }

  private _validateFormFields() {
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_CARD_NUMBER
    });
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_EXPIRATION_DATE
    });
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_SECURITY_CODE
    });
    this._validation.setFormValidity(this._formFieldsValidity);
  }

  private _publishBlurEvent(event: IMessageBusEvent): void {
    this.messageBus.publish(event);
  }

  private _formFieldChange(event: string, value: string) {
    switch (event) {
      case MessageBus.EVENTS.CHANGE_CARD_NUMBER:
        this._setCardPan(value);
        break;
      case MessageBus.EVENTS.CHANGE_EXPIRATION_DATE:
        this._setCardExpiryDate(value);
        break;
      case MessageBus.EVENTS.CHANGE_SECURITY_CODE:
        this._setCardSecurityCode(value);
        break;
    }
  }

  private _getPan(): string {
    return JwtDecode<IDecodedJwt>(this.params.jwt).payload.pan
      ? JwtDecode<IDecodedJwt>(this.params.jwt).payload.pan
      : '';
  }

  private _setCardExpiryDate(value: string): void {
    this._card.expirydate = value;
  }

  private _setCardPan(value: string): void {
    this._card.pan = value;
  }

  private _setCardSecurityCode(value: string): void {
    this._card.securitycode = value;
  }

  private _setFormFieldsValidities(): void {
    this._formFieldsValidity.cardNumber.state = this._formFields.cardNumber.validity;
    this._formFieldsValidity.expirationDate.state = this._formFields.expirationDate.validity;
    this._formFieldsValidity.securityCode.state = this._formFields.securityCode.validity;
  }

  private _setInstances(): void {
    this._payment = new Payment();
    this._validation = new Validation();
  }

  private _updateMerchantFields(data: IMerchantData): void {
    this._merchantFormData = data;
  }

  private _initCybertonica(): void {
    if (this._config.cybertonicaApiKey) {
      this._cybertonica.init(this._config.cybertonicaApiKey);
    }
  }

  private _initCardinalCommerce(): void {
    this._cardinalCommerce.init(this._config).subscribe(() => {
      this._isPaymentReady = true;

      if (this._config.components.startOnLoad) {
        this.messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS,
          data: new StJwt(this._config.jwt).payload.pan as string
        });

        this.messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
          data: {
            dataInJwt: true,
            requestTypes: this._config.components.requestTypes
          }
        });
      }
    });
  }
}

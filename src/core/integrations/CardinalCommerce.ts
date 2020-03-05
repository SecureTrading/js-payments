import { environment } from '../../environments/environment';
import { CardinalCommerceValidationStatus } from '../models/constants/CardinalCommerceValidationStatus';
import { PaymentBrand } from '../models/constants/PaymentBrand';
import { PaymentEvents } from '../models/constants/PaymentEvents';
import { IAuthorizePaymentResponse } from '../models/IAuthorizePaymentResponse';
import { IFormFieldState } from '../models/IFormFieldState';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IOnCardinalValidated } from '../models/IOnCardinalValidated';
import { IResponseData } from '../models/IResponseData';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { DomMethods } from '../shared/DomMethods';
import { Language } from '../shared/Language';
import { MessageBus } from '../shared/MessageBus';
import { Notification } from '../shared/Notification';
import { Selectors } from '../shared/Selectors';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';
import { GoogleAnalytics } from './GoogleAnalytics';
import { Container } from 'typedi';
import { FramesHub } from '../services/message-bus/FramesHub';

declare const Cardinal: any;

export class CardinalCommerce {
  private static _isCardEnrolledAndNotFrictionless(response: IThreeDQueryResponse) {
    return response.enrolled === 'Y' && response.acsurl !== undefined;
  }

  public messageBus: MessageBus;
  private _cardinalCommerceJWT: string;
  private _cardinalCommerceCacheToken: string;
  private readonly _cachetoken: string;
  private readonly _livestatus: number = 0;
  private readonly _startOnLoad: boolean;
  private _jwt: string;
  private readonly _requestTypes: string[];
  private readonly _threedinit: string;
  private _notification: Notification;
  private _sdkAddress: string = environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL;
  private _bypassCards: string[];
  private _jwtUpdated: boolean;
  private _framesHub: FramesHub;

  constructor(
    startOnLoad: boolean,
    jwt: string,
    requestTypes: string[],
    livestatus?: number,
    cachetoken?: string,
    threedinit?: string,
    bypassCards?: string[]
  ) {
    this._jwtUpdated = false;
    this._startOnLoad = startOnLoad;
    this._jwt = jwt;
    this._threedinit = threedinit ? threedinit : '';
    this._livestatus = livestatus;
    this._cachetoken = cachetoken ? cachetoken : '';
    this._requestTypes = requestTypes;
    this._bypassCards = bypassCards;
    this.messageBus = Container.get(MessageBus);
    this._notification = new Notification();
    this._framesHub = Container.get(FramesHub);
    this._setLiveStatus();
    this._onInit();
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: { newJwt: string }) => {
      const { newJwt } = data;
      this._jwtUpdated = true;
      this._jwt = newJwt;
      this._onInit();
    });
  }

  protected _authenticateCard(responseObject: IThreeDQueryResponse) {
    Cardinal.continue(
      PaymentBrand,
      {
        AcsUrl: responseObject.acsurl,
        Payload: responseObject.threedpayload
      },
      {
        Cart: [],
        OrderDetails: { TransactionId: responseObject.acquirertransactionreference }
      },
      this._cardinalCommerceJWT
    );
  }

  protected _cardinalSetup() {
    Cardinal.setup(PaymentEvents.INIT, {
      jwt: this._cardinalCommerceJWT
    });
  }

  protected _cardinalTrigger() {
    return Cardinal.trigger(PaymentEvents.JWT_UPDATE, this._cardinalCommerceJWT);
  }

  protected _onCardinalLoad() {
    Cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);
    Cardinal.off(PaymentEvents.SETUP_COMPLETE);
    Cardinal.off(PaymentEvents.VALIDATED);

    Cardinal.on(PaymentEvents.SETUP_COMPLETE, () => {
      this._onCardinalSetupComplete();
      GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed');
    });

    Cardinal.on(PaymentEvents.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
      this._onCardinalValidated(data, jwt);
      GoogleAnalytics.sendGaData('event', 'Cardinal', 'validate', 'Cardinal payment validated');
    });
    if (this._jwtUpdated) {
      this._cardinalTrigger();
    } else {
      this._cardinalSetup();
    }
  }

  protected _onCardinalSetupComplete() {
    if (this._startOnLoad) {
      const pan = new StJwt(this._jwt).payload.pan as string;
      this._performBinDetection(pan);
      const submitFormEvent: IMessageBusEvent = {
        data: { dataInJwt: true, requestTypes: this._requestTypes, bypassCards: this._bypassCards },
        type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM
      };
      this.messageBus.publish(submitFormEvent);
    } else {
      const messageBusEvent: IMessageBusEvent = {
        type: MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL
      };
      this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BIN_PROCESS, (data: IFormFieldState) => {
        const { value } = data;
        this._performBinDetection(value);
      });
      this.messageBus.publish(messageBusEvent);
    }
  }

  protected _onCardinalValidated(data: IOnCardinalValidated, jwt: string) {
    const { ActionCode, ErrorNumber, ErrorDescription } = data;
    const translator = new Translator(new StJwt(this._jwt).locale);
    let errorNum: any = ErrorNumber;
    if (errorNum !== undefined) {
      errorNum = errorNum.toString();
    }
    const responseData: IResponseData = {
      acquirerresponsecode: errorNum,
      acquirerresponsemessage: ErrorDescription,
      errorcode: '50003',
      errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
    };
    responseData.errormessage = translator.translate(responseData.errormessage);
    const notificationEvent: IMessageBusEvent = {
      data: responseData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
    };

    if (CardinalCommerceValidationStatus.includes(ActionCode)) {
      this._authorizePayment({ threedresponse: jwt });
    } else {
      const resetNotificationEvent: IMessageBusEvent = {
        type: MessageBus.EVENTS_PUBLIC.RESET_JWT
      };
      this.messageBus.publish(resetNotificationEvent);
      this.messageBus.publish(notificationEvent);
      this._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    }
  }

  protected _performBinDetection(bin: string) {
    return Cardinal.trigger(PaymentEvents.BIN_PROCESS, bin);
  }

  protected _threeDSetup() {
    DomMethods.insertScript('head', {
      src: this._sdkAddress,
      id: 'cardinalCommerce'
    }).then(() => this._onCardinalLoad());
  }

  private _authorizePayment(data?: IAuthorizePaymentResponse | object) {
    data = data || {};
    if (data) {
      // @ts-ignore
      data.cachetoken = this._cardinalCommerceCacheToken;
    }

    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
    };
    this.messageBus.publish(messageBusEvent);
    GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed');
  }

  private _initSubscriptions() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.LOAD_CONTROL_FRAME, () => {
      this._onLoadControlFrame();
    });
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDINIT_RESPONSE, (data: IThreeDInitResponse) => {
      this._onThreeDInitEvent(data);
    });
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_INIT, () => {
      this._onBypassJsInitEvent();
    });
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDQUERY, (data: any) => {
      this._onThreeDQueryEvent(data);
    });
    this._initSubmitEventListener();
  }

  private _publishRequestTypesEvent(requestTypes: string[]) {
    this._framesHub.waitForFrame(Selectors.CONTROL_FRAME_IFRAME).subscribe(() => {
      this.messageBus.publish({
        data: { requestTypes },
        type: MessageBus.EVENTS_PUBLIC.SET_REQUEST_TYPES
      });
    });
  }

  private _onInit() {
    this._initSubscriptions();
    this._publishRequestTypesEvent(this._requestTypes);
  }

  private _onLoadControlFrame() {
    if (this._cachetoken) {
      this._bypassInitRequest();
    } else {
      this._threeDInitRequest();
    }
  }

  private _onBypassJsInitEvent() {
    this._cardinalCommerceJWT = this._threedinit;
    this._cardinalCommerceCacheToken = this._cachetoken;
    this._threeDSetup();
  }

  private _onThreeDInitEvent(data: IThreeDInitResponse) {
    let cachetoken: string;
    let threedinit: string;
    if (data) {
      cachetoken = data.cachetoken;
      threedinit = data.threedinit;
    }
    this._cardinalCommerceJWT = threedinit;
    this._cardinalCommerceCacheToken = cachetoken;
    this._threeDSetup();
  }

  private _onThreeDQueryEvent(data: IThreeDQueryResponse) {
    this._threeDQueryRequest(data);
  }

  private _bypassInitRequest() {
    const messageBusEvent: IMessageBusEvent = {
      data: this._cachetoken,
      type: MessageBus.EVENTS_PUBLIC.BY_PASS_INIT
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _setLiveStatus() {
    if (this._livestatus) {
      this._sdkAddress = environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL;
    }
  }

  private _threeDInitRequest() {
    const messageBusEvent: IMessageBusEvent = {
      type: MessageBus.EVENTS_PUBLIC.THREEDINIT_REQUEST
    };
    this.messageBus.publish(messageBusEvent);
  }

  private _threeDQueryRequest(responseObject: IThreeDQueryResponse) {
    if (CardinalCommerce._isCardEnrolledAndNotFrictionless(responseObject)) {
      this._authenticateCard(responseObject);
      GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated');
    } else {
      this._authorizePayment();
    }
  }

  private _initSubmitEventListener(): void {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.BY_PASS_CARDINAL, (data: any) => {
      const { pan, expirydate, securitycode } = data;
      const postData: any = {
        expirydate,
        pan,
        securitycode
      };

      this._byPassAuthorizePayment(postData);
    });
  }

  private _byPassAuthorizePayment(data: any): void {
    const messageBusEvent: IMessageBusEvent = {
      data,
      type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
    };
    this.messageBus.publish(messageBusEvent);
  }
}

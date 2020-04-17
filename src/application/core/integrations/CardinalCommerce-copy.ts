// import { environment } from '../../../environments/environment';
// import { CardinalCommerceValidationStatus } from '../models/constants/CardinalCommerceValidationStatus';
// import { PaymentBrand } from '../models/constants/PaymentBrand';
// import { PaymentEvents } from '../models/constants/PaymentEvents';
// import { IAuthorizePaymentResponse } from '../models/IAuthorizePaymentResponse';
// import { IFormFieldState } from '../models/IFormFieldState';
// import { IMessageBusEvent } from '../models/IMessageBusEvent';
// import { IOnCardinalValidated } from '../models/IOnCardinalValidated';
// import { IResponseData } from '../models/IResponseData';
// import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
// import { DomMethods } from '../shared/DomMethods';
// import { Language } from '../shared/Language';
// import { MessageBus } from '../shared/MessageBus';
// import { StJwt } from '../shared/StJwt';
// import { Translator } from '../shared/Translator';
// import { GoogleAnalytics } from './GoogleAnalytics';
// import { Service } from 'typedi';
// import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
// import { NotificationService } from '../../../client/classes/notification/NotificationService';
// import { IConfig } from '../../../shared/model/config/IConfig';
// import { CardinalCommerceTokensProvider } from './cardinal-commerce/CardinalCommerceTokensProvider';
// import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
// import { ICardinalCommerceTokens } from './cardinal-commerce/ICardinalCommerceTokens';
// import { from, Observable } from 'rxjs';
// import { ICardinal } from './cardinal-commerce/ICardinal';
// import { ofType } from '../../../shared/services/message-bus/operators/ofType';
//
// declare const Cardinal: ICardinal;
//
// export class CardinalCommerce {
//   private static readonly UI_EVENTS = {
//     RENDER: 'ui.render',
//     CLOSE: 'ui.close'
//   };
//   private _cardinalTokens: ICardinalCommerceTokens;
//   private _cardinalCommerceJWT: string;
//   private _cardinalCommerceCacheToken: string;
//   private _startOnLoad: boolean;
//   private _jwt: string;
//   private _requestTypes: string[];
//   private _sdkAddress: string = environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL;
//   private _bypassCards: string[];
//   private cardinal$: Observable<ICardinal>;
//
//   constructor(
//     private messageBus: MessageBus,
//     private notification: NotificationService,
//     private framesHub: FramesHub,
//     private tokenProvider: CardinalCommerceTokensProvider,
//   ) {
//   }
//
//   init(config: IConfig): Observable<ICardinal> {
//     this._startOnLoad = config.components.startOnLoad;
//     this._jwt = config.jwt;
//     this._sdkAddress = config.livestatus ? environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL : null;
//     this._requestTypes = config.components.requestTypes;
//     this._bypassCards = config.bypassCards;
//     this._initSubscriptions();
//
//     this.cardinal$ = this.acquireCardinalCommerceTokens().pipe(
//       switchMap(tokens => this.setupCardinalCommerceLibrary(tokens)),
//       tap(() => this._performBinDetection(this.extractPanFromJwt(this._jwt))),
//       tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.LOAD_CARDINAL })),
//       tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
//     );
//
//     this.cardinal$.subscribe(() => {
//       if (this._startOnLoad) {
//         this.messageBus.publish({
//           type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
//           data: { dataInJwt: true, requestTypes: this._requestTypes, bypassCards: this._bypassCards },
//         });
//       }
//     });
//
//     this.messageBus.pipe(
//       ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT),
//       tap((event: IMessageBusEvent<{ newJwt: string }>) => this._jwt = event.data.newJwt),
//       switchMap(() => this.acquireCardinalCommerceTokens()),
//       withLatestFrom(this.cardinal$),
//     ).subscribe(([tokens, cardinal]) => cardinal.trigger(PaymentEvents.JWT_UPDATE, tokens.jwt));
//
//     this.messageBus.pipe(
//       ofType(MessageBus.EVENTS_PUBLIC.DESTROY),
//       switchMap(() => this.cardinal$),
//     ).subscribe(cardinal => {
//       cardinal.off(PaymentEvents.SETUP_COMPLETE);
//       cardinal.off(PaymentEvents.VALIDATED);
//       cardinal.off(CardinalCommerce.UI_EVENTS.RENDER);
//       cardinal.off(CardinalCommerce.UI_EVENTS.CLOSE);
//     });
//
//     this.messageBus.pipe(
//       ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS),
//     ).subscribe((event: IMessageBusEvent<IFormFieldState>) => this._performBinDetection(event.data.value));
//
//     return this.cardinal$;
//   }
//
//   private acquireCardinalCommerceTokens(): Observable<ICardinalCommerceTokens> {
//     return this.tokenProvider.getTokens().pipe(
//       tap(tokens => this._cardinalTokens = tokens),
//       tap(tokens => this.messageBus.publish({
//         type: MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
//         data: tokens,
//       })),
//     );
//   }
//
//   private setupCardinalCommerceLibrary(tokens: ICardinalCommerceTokens): Observable<ICardinal> {
//     const scriptOptions = {
//       src: this._sdkAddress,
//       id: 'cardinalCommerce',
//     };
//
//     return from(DomMethods.insertScript('head', scriptOptions)).pipe(
//       map(() => Cardinal),
//       switchMap(cardinal => {
//         const setupCompleted$ = new Observable(observer => cardinal.on(PaymentEvents.SETUP_COMPLETE, () => {
//           observer.next(cardinal);
//           observer.complete();
//         }));
//
//         cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);
//
//         cardinal.on(PaymentEvents.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
//           this._onCardinalValidated(data, jwt);
//           GoogleAnalytics.sendGaData('event', 'Cardinal', 'validate', 'Cardinal payment validated');
//         });
//         cardinal.on(CardinalCommerce.UI_EVENTS.RENDER, () => {
//           this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_SHOW }, true);
//         });
//         cardinal.on(CardinalCommerce.UI_EVENTS.CLOSE, () => {
//           this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_HIDE }, true);
//         });
//         cardinal.setup(PaymentEvents.INIT, {
//           jwt: this._cardinalCommerceJWT
//         });
//
//         return setupCompleted$;
//       }),
//     );
//   }
//
//   protected _authenticateCard(responseObject: IThreeDQueryResponse) {
//     Cardinal.continue(
//       PaymentBrand,
//       {
//         AcsUrl: responseObject.acsurl,
//         Payload: responseObject.threedpayload
//       },
//       {
//         Cart: [],
//         OrderDetails: { TransactionId: responseObject.acquirertransactionreference }
//       },
//       this._cardinalCommerceJWT
//     );
//   }
//
//   protected _onCardinalValidated(data: IOnCardinalValidated, jwt: string) {
//     const { ActionCode, ErrorNumber, ErrorDescription } = data;
//     const translator = new Translator(new StJwt(this._jwt).locale);
//     let errorNum: any = ErrorNumber;
//     if (errorNum !== undefined) {
//       errorNum = errorNum.toString();
//     }
//     const responseData: IResponseData = {
//       acquirerresponsecode: errorNum,
//       acquirerresponsemessage: ErrorDescription,
//       errorcode: '50003',
//       errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
//     };
//     responseData.errormessage = translator.translate(responseData.errormessage);
//     const notificationEvent: IMessageBusEvent = {
//       data: responseData,
//       type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
//     };
//
//     if (CardinalCommerceValidationStatus.includes(ActionCode)) {
//       this._authorizePayment({ threedresponse: jwt });
//     } else {
//       const resetNotificationEvent: IMessageBusEvent = {
//         type: MessageBus.EVENTS_PUBLIC.RESET_JWT
//       };
//       this.messageBus.publish(resetNotificationEvent);
//       this.messageBus.publish(notificationEvent);
//       this.notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
//     }
//   }
//
//   protected _performBinDetection(bin: string) {
//     return Cardinal.trigger(PaymentEvents.BIN_PROCESS, bin);
//   }
//
//   private _initSubscriptions() {
//     this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.THREEDQUERY, (data: any) => {
//       this._onThreeDQueryEvent(data);
//     });
//   }
//
//   private _authorizePayment(data?: IAuthorizePaymentResponse | object) {
//     data = data || {};
//     if (data) {
//       // @ts-ignore
//       data.cachetoken = this._cardinalCommerceCacheToken;
//     }
//
//     const messageBusEvent: IMessageBusEvent = {
//       data,
//       type: MessageBus.EVENTS_PUBLIC.PROCESS_PAYMENTS
//     };
//     this.messageBus.publish(messageBusEvent);
//     GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed');
//   }
//
//   private _onThreeDQueryEvent(responseObject: IThreeDQueryResponse) {
//     const isCardEnrolledAndNotFrictionless = responseObject.enrolled === 'Y' && responseObject.acsurl !== undefined;
//
//     if (isCardEnrolledAndNotFrictionless) {
//       this._authenticateCard(responseObject);
//       GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated');
//     } else {
//       this._authorizePayment();
//     }
//   }
//
//   private extractPanFromJwt(jwt: string):string {
//     return new StJwt(jwt).payload.pan as string;
//   }
// }

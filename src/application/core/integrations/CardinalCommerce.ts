import { environment } from '../../../environments/environment';
import { CardinalCommerceValidationStatus } from '../models/constants/CardinalCommerceValidationStatus';
import { PaymentBrand } from '../models/constants/PaymentBrand';
import { PaymentEvents } from '../models/constants/PaymentEvents';
import { IFormFieldState } from '../models/IFormFieldState';
import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IOnCardinalValidated } from '../models/IOnCardinalValidated';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { MessageBus } from '../shared/MessageBus';
import { GoogleAnalytics } from './GoogleAnalytics';
import { Service } from 'typedi';
import { FramesHub } from '../../../shared/services/message-bus/FramesHub';
import { NotificationService } from '../../../client/classes/notification/NotificationService';
import { IConfig } from '../../../shared/model/config/IConfig';
import { CardinalCommerceTokensProvider } from './cardinal-commerce/CardinalCommerceTokensProvider';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ICardinalCommerceTokens } from './cardinal-commerce/ICardinalCommerceTokens';
import { defer, from, Observable, of } from 'rxjs';
import { ICardinal } from './cardinal-commerce/ICardinal';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../models/ICard';
import { IMerchantData } from '../models/IMerchantData';
import { StTransport } from '../services/StTransport.class';
import { CardinalProvider } from './cardinal-commerce/CardinalProvider';
import { IAuthorizePaymentResponse } from '../models/IAuthorizePaymentResponse';

@Service()
export class CardinalCommerce {
  private static readonly UI_EVENTS = {
    RENDER: 'ui.render',
    CLOSE: 'ui.close'
  };
  private cardinalTokens: ICardinalCommerceTokens;
  private cardinal$: Observable<ICardinal>;
  private cardinalValidated$: Observable<[IOnCardinalValidated, string]>;

  constructor(
    private messageBus: MessageBus,
    private notification: NotificationService,
    private framesHub: FramesHub,
    private tokenProvider: CardinalCommerceTokensProvider,
    private stTransport: StTransport,
    private cardinalProvider: CardinalProvider
  ) {}

  init(config: IConfig): Observable<ICardinal> {
    this._initSubscriptions();

    this.cardinal$ = this.acquireCardinalCommerceTokens().pipe(
      switchMap(tokens => this.setupCardinalCommerceLibrary(tokens, Boolean(config.livestatus))),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed'))
    );

    this.cardinalValidated$ = this.cardinal$.pipe(
      switchMap(
        cardinal =>
          new Observable(observer =>
            cardinal.on(PaymentEvents.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
              observer.next([data, jwt]);
              observer.complete();
            })
          )
      )
    );

    return this.cardinal$;
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IAuthorizePaymentResponse> {
    const threeDQueryRequestBody = {
      cachetoken: this.cardinalTokens.cacheToken,
      requesttypedescriptions: requestTypes,
      termurl: 'https://termurl.com', // TODO this shouldn't be needed but currently the backend needs this
      ...merchantData,
      ...card
    };

    return from(this.stTransport.sendRequest(threeDQueryRequestBody)).pipe(
      switchMap(response => this._authenticateCard(response.response)),
      map(([validationResult, jwt]) => {
        if (!CardinalCommerceValidationStatus.includes(validationResult.ActionCode)) {
          throw validationResult;
        }

        return {
          threedresponse: jwt,
          cachetoken: this.cardinalTokens.cacheToken
        };
      }),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private acquireCardinalCommerceTokens(): Observable<ICardinalCommerceTokens> {
    return this.tokenProvider.getTokens().pipe(
      tap(tokens => (this.cardinalTokens = tokens)),
      tap(tokens =>
        this.messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
          data: tokens
        })
      )
    );
  }

  private setupCardinalCommerceLibrary(tokens: ICardinalCommerceTokens, liveStatus: boolean): Observable<ICardinal> {
    return this.cardinalProvider.getCardinal$(liveStatus).pipe(
      switchMap(cardinal => {
        cardinal.configure(environment.CARDINAL_COMMERCE.CONFIG);

        cardinal.on(CardinalCommerce.UI_EVENTS.RENDER, () => {
          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_SHOW }, true);
        });
        cardinal.on(CardinalCommerce.UI_EVENTS.CLOSE, () => {
          this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CONTROL_FRAME_HIDE }, true);
        });

        return new Observable(observer => {
          cardinal.on(PaymentEvents.SETUP_COMPLETE, () => {
            observer.next(cardinal);
            observer.complete();
          });

          cardinal.setup(PaymentEvents.INIT, {
            jwt: tokens.jwt
          });
        });
      })
    );
  }

  private _authenticateCard(responseObject: IThreeDQueryResponse): Observable<[IOnCardinalValidated, string]> {
    const isCardEnrolledAndNotFrictionless = responseObject.enrolled === 'Y' && responseObject.acsurl !== undefined;

    if (!isCardEnrolledAndNotFrictionless) {
      return of({}, '');
    }

    return this.cardinal$.pipe(
      switchMap(cardinal => {
        cardinal.continue(
          PaymentBrand,
          {
            AcsUrl: responseObject.acsurl,
            Payload: responseObject.threedpayload
          },
          {
            Cart: [],
            OrderDetails: {
              TransactionId: responseObject.acquirertransactionreference
            }
          },
          this.cardinalTokens.jwt
        );

        GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated');

        return this.cardinalValidated$;
      })
    );
  }

  private _initSubscriptions() {
    this.messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT),
        switchMap(() => this.acquireCardinalCommerceTokens()),
        withLatestFrom(defer(() => this.cardinal$))
      )
      .subscribe(([tokens, cardinal]) => cardinal.trigger(PaymentEvents.JWT_UPDATE, tokens.jwt));

    this.messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.DESTROY),
        switchMap(() => this.cardinal$)
      )
      .subscribe(cardinal => {
        cardinal.off(PaymentEvents.SETUP_COMPLETE);
        cardinal.off(PaymentEvents.VALIDATED);
        cardinal.off(CardinalCommerce.UI_EVENTS.RENDER);
        cardinal.off(CardinalCommerce.UI_EVENTS.CLOSE);
      });

    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS), withLatestFrom(defer(() => this.cardinal$)))
      .subscribe(([event, cardinal]: [IMessageBusEvent<IFormFieldState>, ICardinal]) => {
        cardinal.trigger(PaymentEvents.BIN_PROCESS, event.data.value);
      });
  }
}

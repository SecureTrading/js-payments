import { environment } from '../../../../environments/environment';
import { CardinalCommerceValidationStatus } from '../../models/constants/CardinalCommerceValidationStatus';
import { PaymentBrand } from '../../models/constants/PaymentBrand';
import { PaymentEvents } from '../../models/constants/PaymentEvents';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IOnCardinalValidated } from '../../models/IOnCardinalValidated';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { StCodec } from '../../services/st-codec/StCodec.class';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { GoogleAnalytics } from '../google-analytics/GoogleAnalytics';
import { Service } from 'typedi';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { CardinalCommerceTokensProvider } from './CardinalCommerceTokensProvider';
import { filter, first, map, mapTo, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { from, Observable, of, Subject, throwError } from 'rxjs';
import { ICardinal } from './ICardinal';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { CardinalProvider } from './CardinalProvider';
import { IAuthorizePaymentResponse } from '../../models/IAuthorizePaymentResponse';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';

@Service()
export class CardinalCommerce {
  public static readonly UI_EVENTS = {
    RENDER: 'ui.render',
    CLOSE: 'ui.close'
  };
  private cardinalTokens: ICardinalCommerceTokens;
  private cardinal$: Observable<ICardinal>;
  private cardinalValidated$: Subject<[IOnCardinalValidated, string]>;
  private destroy$: Observable<void>;

  constructor(
    private messageBus: MessageBus,
    private notification: NotificationService,
    private framesHub: FramesHub,
    private tokenProvider: CardinalCommerceTokensProvider,
    private stTransport: StTransport,
    private cardinalProvider: CardinalProvider
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(MessageBus.EVENTS_PUBLIC.DESTROY), mapTo(void 0));
    this.cardinalValidated$ = new Subject<[IOnCardinalValidated, string]>();

    this.cardinalValidated$
      .pipe(filter(data => data[0].ActionCode === 'ERROR'))
      .subscribe(() => this.notification.error(COMMUNICATION_ERROR_INVALID_RESPONSE));
  }

  init(config: IConfig): Observable<ICardinal> {
    this.cardinal$ = this.acquireCardinalCommerceTokens().pipe(
      switchMap(tokens => this.setupCardinalCommerceLibrary(tokens, Boolean(config.livestatus))),
      tap(cardinal => this._initSubscriptions(cardinal)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
      shareReplay(1)
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
      tap((response: { response: IThreeDQueryResponse }) => (this.stTransport._threeDQueryResult = response)),
      switchMap((response: { response: IThreeDQueryResponse }) => this._authenticateCard(response.response)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed')),
      map(jwt => ({
        threedresponse: jwt,
        cachetoken: this.cardinalTokens.cacheToken
      }))
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
        cardinal.on(PaymentEvents.VALIDATED, (data: IOnCardinalValidated, jwt: string) => {
          this.cardinalValidated$.next([data, jwt]);
        });

        return new Observable<ICardinal>(observer => {
          cardinal.on(PaymentEvents.SETUP_COMPLETE, () => {
            observer.next(cardinal);
            observer.complete();
            this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true);
          });

          cardinal.setup(PaymentEvents.INIT, {
            jwt: tokens.jwt
          });
        });
      })
    );
  }

  private _authenticateCard(responseObject: IThreeDQueryResponse): Observable<string | undefined> {
    const isCardEnrolledAndNotFrictionless = responseObject.enrolled === 'Y' && responseObject.acsurl !== undefined;

    if (!isCardEnrolledAndNotFrictionless) {
      return of(undefined);
    }

    const cardinalContinue = (cardinal: ICardinal) => {
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
    };

    return this.cardinal$.pipe(
      tap(cardinal => cardinalContinue(cardinal)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap(() => this.cardinalValidated$.pipe(first())),
      switchMap(([validationResult, jwt]: [IOnCardinalValidated, string]) => {
        if (
          !CardinalCommerceValidationStatus.includes(validationResult.ActionCode) ||
          validationResult.ActionCode === 'FAILURE'
        ) {
          StCodec.publishResponse(
            this.stTransport._threeDQueryResult.response,
            this.stTransport._threeDQueryResult.jwt,
            jwt
          );
          return throwError(validationResult);
        }

        return of(jwt);
      })
    );
  }

  private _initSubscriptions(cardinal: ICardinal): void {
    this.messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT),
        switchMap(() => this.acquireCardinalCommerceTokens()),
        takeUntil(this.destroy$)
      )
      .subscribe(tokens => cardinal.trigger(PaymentEvents.JWT_UPDATE, tokens.jwt));

    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS), takeUntil(this.destroy$))
      .subscribe((event: IMessageBusEvent<string>) => cardinal.trigger(PaymentEvents.BIN_PROCESS, event.data));

    this.destroy$.subscribe(() => {
      cardinal.off(PaymentEvents.SETUP_COMPLETE);
      cardinal.off(PaymentEvents.VALIDATED);
      cardinal.off(CardinalCommerce.UI_EVENTS.RENDER);
      cardinal.off(CardinalCommerce.UI_EVENTS.CLOSE);
    });
  }
}

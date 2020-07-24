import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { StCodec } from '../../services/StCodec.class';
import { MessageBus } from '../../shared/MessageBus';
import { GoogleAnalytics } from '../GoogleAnalytics';
import { Service } from 'typedi';
import { NotificationService } from '../../../../client/classes/notification/NotificationService';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { CardinalCommerceTokensProvider } from './CardinalCommerceTokensProvider';
import { map, switchMap, tap } from 'rxjs/operators';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { Observable, of, throwError } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { StTransport } from '../../services/StTransport.class';
import { IAuthorizePaymentResponse } from '../../models/IAuthorizePaymentResponse';
import { Language } from '../../shared/Language';
import { CardinalRemoteClient } from './CardinalRemoteClient';
import { GatewayClient } from '../../services/GatewayClient';
import { IContinueData } from '../../../../shared/integrations/cardinal-commerce/IContinueData';
import { ThreeDQueryRequest } from './ThreeDQueryRequest';
import { IValidationResult } from '../../../../shared/integrations/cardinal-commerce/IValidationResult';
import { ActionCode } from '../../../../shared/integrations/cardinal-commerce/ActionCode';

@Service()
export class CardinalCommerce {
  private cardinalTokens: ICardinalCommerceTokens;

  constructor(
    private messageBus: MessageBus,
    private notification: NotificationService,
    private tokenProvider: CardinalCommerceTokensProvider,
    private stTransport: StTransport,
    private cardinalClient: CardinalRemoteClient,
    private gatewayClient: GatewayClient
  ) {}

  init(config: IConfig): Observable<ICardinalCommerceTokens | undefined> {
    if (config.deferInit) {
      return of(this.cardinalTokens);
    }

    return this.ensureCardinalReady();
  }

  performThreeDQuery(
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IAuthorizePaymentResponse> {
    return this.ensureCardinalReady().pipe(
      map(tokens => new ThreeDQueryRequest(tokens.cacheToken, requestTypes, card, merchantData)),
      switchMap(request => this.gatewayClient.threedQuery(request)),
      switchMap(response => this._authenticateCard(response)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal auth completed'))
    );
  }

  private _authenticateCard(responseObject: IThreeDQueryResponse): Observable<IAuthorizePaymentResponse | undefined> {
    const isCardEnrolledAndNotFrictionless = responseObject.enrolled === 'Y' && responseObject.acsurl !== undefined;

    if (!isCardEnrolledAndNotFrictionless) {
      return of(undefined);
    }

    return this.createContinueData(responseObject).pipe(
      switchMap((data: IContinueData) => this.cardinalClient.continue(data)),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'auth', 'Cardinal card authenticated')),
      switchMap(validationResult => this.handleCardValidationResult(validationResult))
    );
  }

  private ensureCardinalReady(): Observable<ICardinalCommerceTokens> {
    if (this.cardinalTokens) {
      return of(this.cardinalTokens);
    }

    return this.tokenProvider.getTokens().pipe(
      tap(tokens => (this.cardinalTokens = tokens)),
      switchMap(tokens => this.cardinalClient.setup(tokens.jwt)),
      map(() => this.cardinalTokens),
      tap(() => GoogleAnalytics.sendGaData('event', 'Cardinal', 'init', 'Cardinal Setup Completed')),
      tap(() => this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.UNLOCK_BUTTON }, true)),
      tap(() => {
        this.messageBus
          .pipe(ofType(MessageBus.EVENTS_PUBLIC.BIN_PROCESS))
          .subscribe((event: IMessageBusEvent<string>) => this.cardinalClient.binProcess(event.data));
      })
    );
  }

  private createContinueData(threeDQueryResponse: IThreeDQueryResponse): Observable<IContinueData> {
    return this.tokenProvider.getTokens().pipe(
      map(tokens => ({
        transactionId: threeDQueryResponse.acquirertransactionreference,
        jwt: tokens.jwt,
        acsUrl: threeDQueryResponse.acsurl,
        payload: threeDQueryResponse.threedpayload
      }))
    );
  }

  private handleCardValidationResult(validationResult: IValidationResult): Observable<IAuthorizePaymentResponse> {
    switch (validationResult.ActionCode) {
      case ActionCode.ERROR:
        this.notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
        return throwError(validationResult);
      case ActionCode.FAILURE:
        StCodec.publishResponse(
          this.stTransport._threeDQueryResult.response,
          this.stTransport._threeDQueryResult.jwt,
          validationResult.jwt
        );
        return throwError(validationResult);
      case ActionCode.SUCCESS:
      case ActionCode.NOACTION:
        return of({
          cachetoken: this.cardinalTokens.cacheToken,
          threedresponse: validationResult.jwt
        });
    }
  }
}

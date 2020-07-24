import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Store } from '../../store/Store';
import { selectTokens } from '../../store/selectors/cardinal';
import { GatewayClient } from '../../services/GatewayClient';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';

@Service()
export class CardinalCommerceTokensProvider {
  constructor(private store: Store, private gatewayClient: GatewayClient) {}

  getTokens(): Observable<ICardinalCommerceTokens> {
    return this.performJsInitRequestIfNecessary().pipe(
      switchMap(() => this.store.select$(selectTokens)),
      filter(tokens => Boolean(tokens.jwt && tokens.cacheToken))
    );
  }

  private performJsInitRequestIfNecessary(): Observable<IThreeDInitResponse | void> {
    const { jwt, cacheToken, jsinitPending } = this.store.getState().cardinal;

    if (jsinitPending || (jwt && cacheToken)) {
      return of(void 0);
    }

    return this.gatewayClient.jsInit();
  }
}

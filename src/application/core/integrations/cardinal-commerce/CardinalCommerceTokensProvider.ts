import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { ThreeDInitRequest } from './ThreeDInitRequest';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { map, tap } from 'rxjs/operators';
import { StTransport } from '../../services/StTransport.class';
import { MessageBus } from '../../shared/MessageBus';
import { ConfigProvider } from '../../../../shared/services/config/ConfigProvider';

@Service()
export class CardinalCommerceTokensProvider {
  constructor(
    private configProvider: ConfigProvider,
    private stTransport: StTransport,
    private messageBus: MessageBus
  ) {}

  getTokens(): Observable<ICardinalCommerceTokens> {
    const config = this.configProvider.getConfig();

    if (config.init.cachetoken && config.init.threedinit) {
      const { cachetoken, threedinit } = config.init;

      return of({ cacheToken: cachetoken, jwt: threedinit });
    }

    return this.performThreeDInitRequest().pipe(
      tap((response: IThreeDInitResponse) =>
        this.messageBus.publish({
          data: response,
          type: MessageBus.EVENTS_PUBLIC.JSINIT_RESPONSE
        })
      ),
      map(response => ({ cacheToken: response.cachetoken, jwt: response.threedinit }))
    );
  }

  private performThreeDInitRequest(): Observable<IThreeDInitResponse> {
    return from(this.stTransport.sendRequest(new ThreeDInitRequest())).pipe(
      map((result: { jwt: string; response: IThreeDInitResponse }) => result.response)
    );
  }
}

import { Service } from 'typedi';
import { ConfigProvider } from '../../services/ConfigProvider';
import { from, Observable, of } from 'rxjs';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { ThreeDInitRequest } from './ThreeDInitRequest';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { map } from 'rxjs/operators';
import { StTransport } from '../../services/StTransport.class';

@Service()
export class CardinalCommerceTokensProvider {
  constructor(private configProvider: ConfigProvider, private stTransport: StTransport) {}

  getTokens(): Observable<ICardinalCommerceTokens> {
    const config = this.configProvider.getConfig();

    if (config.init.cachetoken && config.init.threedinit) {
      const { cachetoken, threedinit } = config.init;

      return of({ cacheToken: cachetoken, jwt: threedinit });
    }

    return this.performThreeDInitRequest().pipe(
      map(response => ({ cacheToken: response.cachetoken, jwt: response.threedinit }))
    );
  }

  private performThreeDInitRequest(): Observable<IThreeDInitResponse> {
    return from(this.stTransport.sendRequest(new ThreeDInitRequest())).pipe(
      map((result: { jwt: string; response: IThreeDInitResponse }) => result.response)
    );
  }
}

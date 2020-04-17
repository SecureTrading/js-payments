import { from, Observable } from 'rxjs';
import { ICardinal } from './ICardinal';
import { Service } from 'typedi';
import { DomMethods } from '../../shared/DomMethods';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

declare const Cardinal: ICardinal;

@Service()
export class CardinalProvider {
  private static readonly SCRIPT_ID = 'cardinalCommerce';

  getCardinal$(liveStatus: boolean): Observable<ICardinal> {
    const sdkAddress = liveStatus
      ? environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL
      : environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL;

    const scriptOptions = {
      src: sdkAddress,
      id: CardinalProvider.SCRIPT_ID
    };

    return from(DomMethods.insertScript('head', scriptOptions)).pipe(map(() => Cardinal));
  }
}

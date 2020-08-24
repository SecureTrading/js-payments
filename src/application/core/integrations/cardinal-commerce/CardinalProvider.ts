import { from, interval, Observable } from 'rxjs';
import { ICardinal } from './ICardinal';
import { Service } from 'typedi';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { delay, filter, first, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ICardinalProvider } from './ICardinalProvider';

declare const Cardinal: ICardinal;

@Service()
export class CardinalProvider implements ICardinalProvider {
  private static readonly SCRIPT_ID = 'cardinalCommerce';

  getCardinal$(liveStatus: boolean): Observable<ICardinal> {
    const sdkAddress = liveStatus
      ? environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL
      : environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL;

    const scriptOptions = {
      src: sdkAddress,
      id: CardinalProvider.SCRIPT_ID
    };

    return from(DomMethods.insertScript('head', scriptOptions)).pipe(
      switchMap(
        () =>
          interval().pipe(
            // @ts-ignore
            map(() => window.Cardinal),
            filter(Boolean),
            first()
          ) as Observable<ICardinal>
      )
    );
  }
}

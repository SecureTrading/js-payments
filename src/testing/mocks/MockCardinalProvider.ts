import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { ICardinal } from '../../application/core/integrations/cardinal-commerce/ICardinal';
import { CardinalMock } from './CardinalMock';
import { ICardinalProvider } from '../../application/core/integrations/cardinal-commerce/ICardinalProvider';

@Service()
export class MockCardinalProvider implements ICardinalProvider {
  getCardinal$(liveStatus: boolean): Observable<ICardinal> {
    return of(new CardinalMock());
  }
}

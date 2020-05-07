import { Observable } from 'rxjs';
import { ICardinal } from './ICardinal';

export interface ICardinalProvider {
  getCardinal$(liveStatus: boolean): Observable<ICardinal>;
}

import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { IThreeDInitResponse } from '../models/IThreeDInitResponse';
import { JSINIT_COMPLETED, JSINIT_STARTED } from '../store/reducers/cardinal/ICardinalActionsMap';
import { ThreeDInitRequest } from '../integrations/cardinal-commerce/ThreeDInitRequest';
import { PUBLIC_EVENTS } from '../shared/EventTypes';
import { Store } from '../store/Store';
import { StTransport } from './StTransport.class';
import { map, tap } from 'rxjs/operators';
import { MessageBus } from '../shared/MessageBus';
import { IThreeDQueryResponse } from '../models/IThreeDQueryResponse';
import { IStRequest } from '../models/IStRequest';

@Service()
export class GatewayClient {
  constructor(private store: Store, private stTransport: StTransport, private messageBus: MessageBus) {}

  jsInit(): Observable<IThreeDInitResponse> {
    this.store.dispatch({ type: JSINIT_STARTED });

    return from(this.stTransport.sendRequest(new ThreeDInitRequest())).pipe(
      map((result: { jwt: string; response: IThreeDInitResponse }) => result.response),
      tap((response: IThreeDInitResponse) => {
        this.store.dispatch({ type: JSINIT_COMPLETED, payload: response });
        this.messageBus.publish({ type: PUBLIC_EVENTS.JSINIT_RESPONSE, data: response });
      })
    );
  }

  threedQuery(request: IStRequest): Observable<IThreeDQueryResponse> {
    return from(this.stTransport.sendRequest(request)).pipe(
      tap((response: { response: IThreeDQueryResponse }) => (this.stTransport._threeDQueryResult = response)),
      map((response: { response: IThreeDQueryResponse }) => response.response)
    );
  }
}

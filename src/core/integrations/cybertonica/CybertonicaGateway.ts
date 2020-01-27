import {StTransport} from '../../classes/StTransport.class';
import { ICybertonicaPostQuery } from '../../models/cybertonica/CybertonicaPostQuery';
import { ICybertonicaPostResponse } from '../../models/cybertonica/CybertonicaPostResponse';

export interface ICybertonicaGateway {
  postQuery(query: ICybertonicaPostQuery): Promise<ICybertonicaPostResponse>;
}

export class CybertonicaGateway implements ICybertonicaGateway {
  private _stTransport: StTransport;

  constructor(private jwt: string, private gatewayUrl: string) {
    this._stTransport = new StTransport({jwt, gatewayUrl});
  }

  postQuery(query: ICybertonicaPostQuery): Promise<ICybertonicaPostResponse> {
    return this._stTransport.sendRequest(query) as Promise<ICybertonicaPostResponse>;
  }
}

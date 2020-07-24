import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IStRequest } from '../../models/IStRequest';

export class ThreeDQueryRequest implements IStRequest {
  readonly termurl = 'https://termurl.com'; // TODO this shouldn't be needed but currently the backend needs this
  readonly cachetoken: string;
  readonly requesttypedescriptions: string[];
  [index: string]: any;

  constructor(cacheToken: string, requestTypes: string[], card: ICard, merchantData: IMerchantData) {
    this.cachetoken = cacheToken;
    this.requesttypedescriptions = requestTypes;
    Object.assign(this, card);
    Object.assign(this, merchantData);
  }
}

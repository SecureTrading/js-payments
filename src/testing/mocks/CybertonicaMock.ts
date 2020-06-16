import { ICybertonica } from '../../application/core/integrations/ICybertonica';
import { Service } from 'typedi';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';

@Service()
export class CybertonicaMock implements ICybertonica {
  private static TID_KEY: string = 'app.tid';
  private static readonly MOCKED_TID = '63d1d099-d635-41b6-bb82-96017f7da6bb';

  constructor(private storage: BrowserLocalStorage) {}

  init(apiUserName: string): Promise<string> {
    if (!apiUserName) {
      return Promise.resolve(undefined);
    }

    const tid = CybertonicaMock.MOCKED_TID;

    this.storage.setItem(CybertonicaMock.TID_KEY, tid);

    return Promise.resolve(tid);
  }

  getTransactionId(): Promise<string> {
    return Promise.resolve(this.storage.getItem(CybertonicaMock.TID_KEY));
  }
}

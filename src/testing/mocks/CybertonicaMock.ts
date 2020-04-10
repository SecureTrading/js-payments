import { ICybertonica } from '../../application/core/integrations/ICybertonica';
import { Service } from 'typedi';

@Service()
export class CybertonicaMock implements ICybertonica {
  private static readonly MOCKED_TID = '63d1d099-d635-41b6-bb82-96017f7da6bb';
  private tid: Promise<string> = Promise.resolve(undefined);

  init(apiUserName: string): Promise<string> {
    if (apiUserName) {
      this.tid = Promise.resolve(CybertonicaMock.MOCKED_TID);
    }

    return this.tid;
  }

  getTransactionId(): Promise<string> {
    return this.tid;
  }
}

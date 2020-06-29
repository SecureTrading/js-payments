import { Service } from 'typedi';
import { FrameAccessor } from '../../../shared/services/message-bus/FrameAccessor';
import { StoreFactory } from './StoreFactory';
import { Store } from 'redux';

@Service()
export class StoreAccessor {
  private static STORE_KEY = 'ST_STORE';

  constructor(private frameAccessor: FrameAccessor, private storeFactory: StoreFactory) {}

  getStore(): Store {
    const controlFrame = this.frameAccessor.getControlFrame();

    if (!controlFrame) {
      throw new Error('Cannot access control-frame');
    }

    if (!controlFrame[StoreAccessor.STORE_KEY]) {
      controlFrame[StoreAccessor.STORE_KEY] = this.storeFactory.createStore();
    }

    return controlFrame[StoreAccessor.STORE_KEY];
  }
}

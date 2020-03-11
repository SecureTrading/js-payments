import { Service } from 'typedi';
import { AbstractStorage } from './AbstractStorage';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';

@Service()
export class BrowserSessionStorage extends AbstractStorage {
  constructor(communicator: InterFrameCommunicator, framesHub: FramesHub) {
    super(window.sessionStorage, communicator, framesHub);
  }

  protected getSychronizationEventName(): string {
    return 'ST_SET_SESSION_STORAGE_ITEM';
  }
}

import { Service } from 'typedi';
import { AbstractStorage } from './AbstractStorage';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';

@Service()
export class BrowserLocalStorage extends AbstractStorage {
  constructor(communicator: InterFrameCommunicator, framesHub: FramesHub) {
    super(window.localStorage, communicator, framesHub);
  }

  protected get SET_ITEM_EVENT(): string {
    return 'ST_SET_LOCAL_STORAGE_ITEM';
  }
}

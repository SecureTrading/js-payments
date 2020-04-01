import { Service } from 'typedi';
import { AbstractStorage } from './AbstractStorage';
import { InterFrameCommunicator } from '../message-bus/InterFrameCommunicator';
import { FramesHub } from '../message-bus/FramesHub';
import { FrameIdentifier } from '../message-bus/FrameIdentifier';

@Service()
export class BrowserSessionStorage extends AbstractStorage {
  constructor(communicator: InterFrameCommunicator, framesHub: FramesHub, identifier: FrameIdentifier) {
    super(window.sessionStorage, communicator, framesHub, identifier);
  }

  protected getSychronizationEventName(): string {
    return 'ST_SET_SESSION_STORAGE_ITEM';
  }
}

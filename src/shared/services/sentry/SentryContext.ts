import { Service } from 'typedi';
import { FrameIdentifier } from '../message-bus/FrameIdentifier';
import { environment } from '../../../environments/environment';

type EnvironmentName = 'dev' | 'prod';

@Service()
export class SentryContext {
  constructor(private frameIdentifier: FrameIdentifier) {}

  getFrameName(): string {
    return this.frameIdentifier.getFrameName();
  }

  getHostName(): string {
    return window.location.hostname;
  }

  getEnvironmentName(): EnvironmentName {
    return environment.production ? 'prod' : 'dev';
  }

  getReleaseVersion(): string {
    return require('../../../../package.json').version;
  }
}

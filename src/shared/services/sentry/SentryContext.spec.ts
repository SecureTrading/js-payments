import { FrameIdentifier } from '../message-bus/FrameIdentifier';
import { instance, mock, when } from 'ts-mockito';
import { Selectors } from '../../../application/core/shared/Selectors';
import { SentryContext } from './SentryContext';

describe('SentryContext', () => {
  let frameIdentifierMock: FrameIdentifier;
  let sentryContext: SentryContext;

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    sentryContext = new SentryContext(instance(frameIdentifierMock));

    when(frameIdentifierMock.getFrameName()).thenReturn(Selectors.CARD_NUMBER_IFRAME);
  });

  it('returns frame name', () => {
    expect(sentryContext.getFrameName()).toEqual(Selectors.CARD_NUMBER_IFRAME);
  });

  it('returns window hostname', () => {
    expect(sentryContext.getHostName()).toMatch(/.+/);
  });

  it('returns environment', () => {
    expect(sentryContext.getEnvironmentName()).toMatch(/dev|prod/);
  });

  it('returns release version', () => {
    expect(sentryContext.getReleaseVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

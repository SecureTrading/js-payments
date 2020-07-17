import { FrameAccessor } from '../../../shared/services/message-bus/FrameAccessor';
import { StoreFactory } from './StoreFactory';
import { StoreAccessor } from './StoreAccessor';
import { instance, mock, when } from 'ts-mockito';
import { Store } from 'redux';
import { IControlFrameWindow } from '../../../shared/interfaces/IControlFrameWindow';

describe('StoreAccessor', () => {
  let frameAccessorMock: FrameAccessor;
  let storeFactoryMock: StoreFactory;
  let storeAccessor: StoreAccessor;

  const store = ({ FOO: 'BAR' } as unknown) as Store;

  beforeEach(() => {
    frameAccessorMock = mock(FrameAccessor);
    storeFactoryMock = mock(StoreFactory);
    storeAccessor = new StoreAccessor(instance(frameAccessorMock), instance(storeFactoryMock));
  });

  it('returns store from control frames window', () => {
    const controlFrameWindow = ({
      stStore: store
    } as unknown) as IControlFrameWindow;

    when(frameAccessorMock.getControlFrame()).thenReturn(controlFrameWindow);

    expect(storeAccessor.getStore()).toBe(store);
  });

  it('creates a new redux store when it has not been created yet', () => {
    const controlFrameWindow = ({} as unknown) as IControlFrameWindow;
    when(frameAccessorMock.getControlFrame()).thenReturn(controlFrameWindow);
    when(storeFactoryMock.createStore()).thenReturn(store);

    expect(storeAccessor.getStore()).toBe(store);
    expect(controlFrameWindow.stStore).toBe(store);
  });

  it('throws an error when control frame is not available', () => {
    when(frameAccessorMock.getControlFrame()).thenReturn(undefined);

    expect(() => storeAccessor.getStore()).toThrowError('Cannot access control-frame');
  });
});

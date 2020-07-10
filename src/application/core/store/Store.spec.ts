import { StoreAccessor } from './StoreAccessor';
import { Store } from './Store';
import { instance, mock, verify, when } from 'ts-mockito';
import { Store as ReduxStore } from 'redux';
import { IState } from './IState';
import { ActionName } from './IAction';
import { BehaviorSubject } from 'rxjs';

describe('Store', () => {
  let storeAccessorMock: StoreAccessor;
  let reduxStoreMock: ReduxStore<IState>;
  let store: Store;
  let state$ = new BehaviorSubject<IState>({} as IState);

  beforeEach(() => {
    storeAccessorMock = mock(StoreAccessor);
    reduxStoreMock = mock<ReduxStore>();

    when(storeAccessorMock.getStore()).thenReturn(instance(reduxStoreMock));
    when(reduxStoreMock.getState()).thenCall(() => state$.getValue());
    when(reduxStoreMock.subscribe).thenCall(listener => {
      state$.subscribe(() => listener());
    });

    store = new Store(instance(storeAccessorMock));
  });

  it('returns current state', () => {
    const state = ({ foo: 'bar' } as unknown) as IState;

    when(reduxStoreMock.getState()).thenReturn(state);

    expect(store.getState()).toBe(state);
  });

  it('dispatches action to store', () => {
    const action = { type: 'FOO' as ActionName };

    store.dispatch(action);

    verify(reduxStoreMock.dispatch(action)).once();
  });

  it('subscribes to the states observable', done => {
    const state = ({ foo: 'bar' } as unknown) as IState;

    state$.next(state);

    store.subscribe(current => {
      expect(current).toBe(state);
      done();
    });
  });

  it('selects a part of the state as observable', done => {
    const state = ({
      foo: {
        bar: {
          xyz: 'abc'
        }
      }
    } as unknown) as IState;

    state$.next(state);

    store
      .select$(value => (value as any).foo.bar.xyz)
      .subscribe(result => {
        expect(result).toEqual('abc');
        done();
      });
  });
});

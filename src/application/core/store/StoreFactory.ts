import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { configReducer } from './reducers/config/ConfigReducer';
import { Service } from 'typedi';
import logger from 'redux-logger';

@Service()
export class StoreFactory {
  createStore(): Store {
    const rootReducer = combineReducers({
      config: configReducer
    });

    return createStore(rootReducer, applyMiddleware(logger));
  }
}

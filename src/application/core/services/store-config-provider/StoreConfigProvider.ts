import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { Service } from 'typedi';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { Observable } from 'rxjs';
import { Store } from '../../store/Store';
import { filter, first } from 'rxjs/operators';

@Service()
export class StoreConfigProvider implements ConfigProvider {
  constructor(private store: Store) {}

  getConfig(): IConfig {
    return this.store.getState().config.config;
  }

  getConfig$(watchForChanges?: boolean): Observable<IConfig> {
    const config$: Observable<IConfig> = this.store
      .select$(state => state.config.config)
      .pipe(filter<IConfig>(Boolean));

    return watchForChanges ? config$ : config$.pipe(first());
  }
}

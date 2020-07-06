import { IConfig } from '../../model/config/IConfig';
import { Observable } from 'rxjs';
import { Service } from 'typedi';

@Service()
export abstract class ConfigProvider {
  abstract getConfig(): IConfig;
  abstract getConfig$(watchForChanges?: boolean): Observable<IConfig>;
}

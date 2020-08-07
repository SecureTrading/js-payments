import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { BehaviorSubject, Observable } from 'rxjs';
import { Service } from 'typedi';
import { DefaultConfig } from '../../application/core/models/constants/config-resolver/DefaultConfig';

@Service()
export class TestConfigProvider implements ConfigProvider {
  private static readonly SAMPLE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1OTQwNDk5MzIsImlzcyI6ImFtMDMxMC5hdXRvYXBpIiwicGF5bG9hZCI6eyJiYXNlYW1vdW50IjoiMjAwMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiJ9fQ.PW9Fb358_OukUIhD_ubU-_h4IwyHScf6RWqbomgGTnc';
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject({
    ...DefaultConfig,
    jwt: TestConfigProvider.SAMPLE_JWT
  });

  getConfig(): IConfig {
    return this.config$.getValue();
  }

  getConfig$(watchForChanges?: boolean): Observable<IConfig> {
    return this.config$.asObservable();
  }

  setConfig(config: IConfig): void {
    this.config$.next(config);
  }
}

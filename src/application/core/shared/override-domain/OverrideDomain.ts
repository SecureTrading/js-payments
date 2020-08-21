import { environment } from '../../../../environments/environment';

if (environment.overrideDomain) {
  document.domain = environment.overrideDomain;
}

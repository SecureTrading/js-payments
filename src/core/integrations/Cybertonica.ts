import { environment } from '../../environments/environment';
import DomMethods from '../shared/DomMethods';

class Cybertonica {
  private static LOAD_SCRIPT_LISTENER: string = 'load';
  private static SCRIPT_TARGET: string = 'head';

  private _integrationScript: string =
    'window.onload = function () {var tid = undefined;if (typeof AFCYBERTONICA !== undefined) {tid = AFCYBERTONICA.init(test);}alert("Send me with the event:" + tid);}';
  private _sdkAddress: string;

  constructor() {
    this._sdkAddress = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
    this._onInit();
  }

  private _loadSdk() {
    DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, this._sdkAddress).addEventListener(
      Cybertonica.LOAD_SCRIPT_LISTENER,
      () => {
        this._loadIntegrationScript();
      }
    );
  }

  private _loadIntegrationScript() {
    document.body.appendChild(document.createElement('script')).textContent = this._integrationScript;
  }

  private _onInit() {
    this._loadSdk();
  }
}

export default Cybertonica;

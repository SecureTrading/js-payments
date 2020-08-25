import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { Translator } from '../../shared/translator/Translator';
import { Service } from 'typedi';
import { IAFCybertonica } from './IAFCybertonica';
import { environment } from '../../../../environments/environment';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { ICybertonica } from './ICybertonica';

declare const AFCYBERTONICA: IAFCybertonica;

@Service()
export class Cybertonica implements ICybertonica {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static LOCALE: string = 'locale';
  private static SCRIPT_TARGET: string = 'head';
  private static TID_KEY: string = 'app.tid';
  private static TID_TIMEOUT = 5000;

  private static getBasename(): string {
    const link = document.createElement('a');
    link.href = Cybertonica.SDK_ADDRESS;
    return 'https://' + link.hostname;
  }

  private translator: Translator;
  private tid: Promise<string> = Promise.resolve(undefined);

  constructor(private storage: BrowserLocalStorage) {
    this.storage.setItem(Cybertonica.TID_KEY, '');
    this.translator = new Translator(this.storage.getItem(Cybertonica.LOCALE));
  }

  private _insertCybertonicaLibrary(): Promise<Element> {
    return DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, { src: Cybertonica.SDK_ADDRESS });
  }

  public init(apiUserName: string): Promise<string> {
    const tid = this._insertCybertonicaLibrary().then(() =>
      AFCYBERTONICA.init(apiUserName, undefined, Cybertonica.getBasename())
    );
    const timeout = new Promise(resolve => setTimeout(() => resolve(null), Cybertonica.TID_TIMEOUT));

    this.tid = Promise.race([tid, timeout]);
    this.tid.then(value => this.storage.setItem(Cybertonica.TID_KEY, value));

    return this.tid;
  }

  public getTransactionId(): Promise<string> {
    const tid = this.storage.getItem(Cybertonica.TID_KEY);

    if (tid !== null && tid !== '') {
      return Promise.resolve(tid);
    }

    return this.tid;
  }
}

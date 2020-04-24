import { DomMethods } from '../shared/DomMethods';
import { Translator } from '../shared/Translator';
import { Service } from 'typedi';
import { IAFCybertonica } from '../models/cybertonica/IAFCybertonica';
import { environment } from '../../../environments/environment';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Language } from '../shared/Language';
import { ICybertonica } from './ICybertonica';

declare const AFCYBERTONICA: IAFCybertonica;

@Service()
export class Cybertonica implements ICybertonica {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static LOCALE: string = 'locale';
  private static SCRIPT_TARGET: string = 'head';
  private static TID_KEY: string = 'app.tid';

  private translator: Translator;
  private tid: Promise<string> = Promise.resolve(undefined);

  constructor(private storage: BrowserLocalStorage) {
    this.translator = new Translator(this.storage.getItem(Cybertonica.LOCALE));
  }

  public init(apiUserName: string): Promise<string> {
    this.tid = DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, { src: Cybertonica.SDK_ADDRESS }).then(
      () => AFCYBERTONICA.init(apiUserName) || this.initFailed()
    );
    this.tid.then(tid => this.storage.setItem(Cybertonica.TID_KEY, tid));

    return this.tid;
  }

  public getTransactionId(): Promise<string> {
    if (this.storage.getItem(Cybertonica.TID_KEY) !== undefined) {
      return Promise.resolve(this.storage.getItem(Cybertonica.TID_KEY));
    }
    return this.tid;
  }

  private initFailed(): void {
    throw new Error(this.translator.translate(Language.translations.PAYMENT_ERROR));
  }
}

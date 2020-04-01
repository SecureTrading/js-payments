import { DomMethods } from '../shared/DomMethods';
import { Translator } from '../shared/Translator';
import { Service } from 'typedi';
import { IAFCybertonica } from '../models/cybertonica/IAFCybertonica';
import { environment } from '../../../environments/environment';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';

declare const AFCYBERTONICA: IAFCybertonica;

@Service()
export class Cybertonica {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static ERROR_KEY: string = 'An error occurred';
  private static LOCALE: string = 'locale';
  private static SCRIPT_TARGET: string = 'head';

  private translator: Translator;
  private tid: Promise<string> = Promise.resolve(undefined);

  constructor(private storage: BrowserLocalStorage) {
    this.translator = new Translator(this.storage.getItem(Cybertonica.LOCALE));
  }

  public init(apiUserName: string): Promise<string> {
    this.tid = DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, { src: Cybertonica.SDK_ADDRESS }).then(
      () => AFCYBERTONICA.init(apiUserName) || this.initFailed()
    );

    return this.tid;
  }

  public getTransactionId(): Promise<string> {
    return this.tid;
  }

  private initFailed(): void {
    throw new Error(this.translator.translate(Cybertonica.ERROR_KEY));
  }
}

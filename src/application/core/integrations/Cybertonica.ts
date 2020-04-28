import { DomMethods } from '../shared/DomMethods';
import { Translator } from '../shared/Translator';
import { Service } from 'typedi';
import { IAFCybertonica } from '../models/cybertonica/IAFCybertonica';
import { environment } from '../../../environments/environment';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Language } from '../shared/Language';
import { ICybertonica } from './ICybertonica';
import { IConfig } from '../../../shared/model/config/IConfig';

declare const AFCYBERTONICA: IAFCybertonica;

@Service()
export class Cybertonica implements ICybertonica {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static readonly STORAGE_KEY = 'app.config';
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

  public addTidToForm(): void {
    const config: IConfig = JSON.parse(this.storage.getItem(Cybertonica.STORAGE_KEY));
    const form: HTMLFormElement = document.getElementById(config.formId) as HTMLFormElement;
    DomMethods.addDataToForm(form, { tid: this.tid });
  }

  private initFailed(): void {
    throw new Error(this.translator.translate(Language.translations.PAYMENT_ERROR));
  }
}

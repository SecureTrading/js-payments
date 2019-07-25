import DomMethods from './../../core/shared/DomMethods';

/**
 * Creates HTML markups <script> and add Google Analytics source to it.
 */
class GoogleAnalytics {
  private static GA_INIT_SCRIPT_CONTENT: string = `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;ga('create', 'UA-XXXXX-Y', 'auto');ga('send', 'pageview');`;
  private static GA_SCRIPT_SRC: string = 'https://www.google-analytics.com/analytics.js';
  private _gaLibrary: HTMLScriptElement;
  private _gaScript: HTMLScriptElement;
  private _gaScriptContent: Text;

  constructor() {
    this._createGAScript();
    this._insertGAScript();
    this._insertGALibrary();
  }

  /**
   *
   * @private
   */
  private _createGAScript() {
    this._gaScript = document.createElement('script');
    this._gaScript.type = 'text/javascript';
    this._gaScriptContent = document.createTextNode(GoogleAnalytics.GA_INIT_SCRIPT_CONTENT);
    return this._gaScript;
  }

  /**
   *
   * @private
   */
  private _insertGAScript() {
    document.head.appendChild(this._gaScript);
  }

  /**
   *
   * @private
   */
  private _insertGALibrary() {
    this._gaLibrary = DomMethods.insertScript('head', GoogleAnalytics.GA_SCRIPT_SRC);
    this._gaLibrary.async = true;
    return this._gaLibrary;
  }
}

export default GoogleAnalytics;

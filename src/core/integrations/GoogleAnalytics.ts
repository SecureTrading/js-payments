/**
 * Creates HTML markups <script> and add Google Analytics source to it.
 */
class GoogleAnalytics {
  private static GA_INIT_SCRIPT_CONTENT = `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;ga('create', 'UA-XXXXX-Y', 'auto');ga('send', 'pageview');`;
  private static GA_SCRIPT_SRC = 'https://www.google-analytics.com/analytics.js';
  private _gaScript: HTMLScriptElement;
  private _gaScriptContent: Text;

  constructor() {
    this._createGAScript();
    this._insertGAScript();
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
}

export default GoogleAnalytics;

import DomMethods from '../shared/DomMethods';
import Notification from '../shared/Notification';

/**
 * Creates HTML markups <script> and add Google Analytics source to it.
 */
class GoogleAnalytics {
  private static GA_MEASUREMENT_ID: number = 144576082;
  private static GA_INIT_SCRIPT_CONTENT: string = `window.ga=window.ga||function(){(ga.q=ga.q||[]).
  push(arguments)};ga.l=+new Date;ga('create', 'UA-${
    GoogleAnalytics.GA_MEASUREMENT_ID
  }-Y', 'auto');ga('send', 'pageview');`;
  private static GA_SCRIPT_SRC: string = 'https://www.google-analytics.com/analytics.js';
  private static GA_DISABLE_COOKIES: string = `ga('create', 'UA-${
    GoogleAnalytics.GA_MEASUREMENT_ID
  }-Y', {'storage': 'none'});`;
  private static GA_IP_ANONYMIZATION: string = `ga('set', 'anonymizeIp', true);`;
  private static GA_DISABLE_ADVERTISING_FEATURES: string = `ga('set', 'allowAdFeatures', false);`;

  /**
   *
   * @private
   */
  private static _returnScriptWithFeatures() {
    return `${GoogleAnalytics.GA_INIT_SCRIPT_CONTENT}
    ${GoogleAnalytics.GA_DISABLE_COOKIES}
    ${GoogleAnalytics.GA_IP_ANONYMIZATION}
    ${GoogleAnalytics.GA_DISABLE_ADVERTISING_FEATURES}`;
  }

  /**
   *
   * @private
   */
  private static _disableUserIDTracking() {
    // @ts-ignore
    return (window[`ga-disable-UA-${GoogleAnalytics.GA_MEASUREMENT_ID}-Y`] = true);
  }

  private _communicate: string;
  private _gaLibrary: HTMLScriptElement;
  private _gaScript: HTMLScriptElement;
  private _gaScriptContent: Text;
  private _notification: Notification;

  constructor() {
    this._notification = new Notification();
    this._onInit();
  }

  /**
   * Initializes Google Analytics scripts on merchants page.
   * Gathers all methods needed to establish GGoogle Analytics functionality.
   * @private
   */
  private _onInit() {
    this._createGAScript()
      .then(response => {
        console.info(response);
        this._insertGAScript()
          .then(response => {
            this._insertGALibrary();
            console.info(response);
            GoogleAnalytics._disableUserIDTracking();
          })
          .catch(error => {
            console.error(error);
          });
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Creates GA script, which is executed inside <script> markup.
   * Appends it in <script> tag.
   * @private
   */
  private _createGAScript() {
    return new Promise((resolve, reject) => {
      this._gaScript = document.createElement('script');
      this._gaScript.type = 'text/javascript';
      this._gaScriptContent = document.createTextNode(GoogleAnalytics._returnScriptWithFeatures());
      this._gaScript.appendChild(this._gaScriptContent);
      resolve((this._communicate = 'Script has been created'));
      reject((this._communicate = 'Script has not been created'));
    });
  }

  /**
   * Appends GA script if it has been successfully created by __createGAScript().
   * @private
   */
  private _insertGAScript() {
    return new Promise((resolve, reject) => {
      document.head.appendChild(this._gaScript);
      resolve((this._communicate = 'Script has been appended'));
      reject((this._communicate = 'Script has not been appended'));
    });
  }

  /**
   * Inserts GA library after the GA script created by _createGAScript().
   * @private
   */
  private _insertGALibrary() {
    this._gaLibrary = DomMethods.insertScript('head', GoogleAnalytics.GA_SCRIPT_SRC);
    this._gaLibrary.async = true;
    document.head.appendChild(this._gaLibrary);
  }
}

export default GoogleAnalytics;

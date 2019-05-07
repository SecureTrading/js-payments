export class Preloader {
  private readonly _buttonSubmit: HTMLInputElement;
  private readonly _inputSubmit: HTMLInputElement;

  constructor() {
    this._buttonSubmit = document.querySelector('button[type="submit"]');
    this._inputSubmit = document.querySelector('input[type="submit"]');
  }

  /**
   * Attaches to specified element text or/and icon and disables it.
   * @param element
   * @param text
   * @param animatedIcon
   * @param disableElement
   * @private
   */
  private static _setPreloader(
    element: HTMLInputElement,
    disableElement: boolean,
    text?: string,
    animatedIcon?: string
  ) {
    element.textContent = `${animatedIcon ? animatedIcon : ''}${text ? text : ''}`;
    element.disabled = disableElement;
    return element;
  }

  /**
   * Finds submit button, disable it and set preloader text or / and icon.
   */
  public setSubmitButtonStatus(disableElement: boolean, text: string) {
    this._inputSubmit && Preloader._setPreloader(this._inputSubmit, disableElement, text);
    this._buttonSubmit && Preloader._setPreloader(this._buttonSubmit, disableElement, text);
  }
}

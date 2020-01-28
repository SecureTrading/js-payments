import { Selectors } from './Selectors';

export class DomMethods {
  private static BODY_MARKUP: string = 'body';
  private static HIDDEN_ATTRIBUTE: string = 'hidden';
  private static INPUT_MARKUP: string = 'input';
  private static SCRIPT_MARKUP: string = 'script';
  private static SELECT_MARKUP: string = 'select';
  private static SRC_ATTRIBUTE: string = 'src';
  private static ST_NAME_ATTRIBUTE: string = 'data-st-name';
  private static STYLE_MARKUP: string = 'style';

  public static addDataToForm(form: HTMLFormElement, data: any, fields?: string[]): void {
    Object.entries(data).forEach(([field, value]) => {
      if (!fields || fields.includes(field)) {
        form.appendChild(
          DomMethods.createHtmlElement(
            {
              name: field,
              type: DomMethods.HIDDEN_ATTRIBUTE,
              value
            },
            DomMethods.INPUT_MARKUP
          )
        );
      }
    });
  }

  public static addListener(targetId: string, listenerType: string, callback: any): void {
    document.getElementById(targetId).addEventListener(listenerType, callback);
  }

  public static appendChildIntoDOM(target: string, child: HTMLElement): Element {
    const element: Element = document.getElementById(target)
      ? document.getElementById(target)
      : document.getElementsByTagName(DomMethods.BODY_MARKUP)[0];
    element.appendChild(child);
    return element;
  }

  public static createHtmlElement = (attributes: any, markup: string): HTMLElement => {
    const element: HTMLElement = document.createElement(markup);
    Object.keys(attributes).map(item => element.setAttribute(item, attributes[item]));
    return element;
  };

  public static getAllFormElements = (form: HTMLElement): any[] => [
    ...Array.prototype.slice.call(form.querySelectorAll(DomMethods.SELECT_MARKUP)),
    ...Array.prototype.slice.call(form.querySelectorAll(DomMethods.INPUT_MARKUP))
  ];

  public static insertScript(target: string, src: string): HTMLScriptElement {
    const targetElement: Element = document.getElementsByTagName(target)[0];
    const script: HTMLScriptElement = document.createElement(DomMethods.SCRIPT_MARKUP) as HTMLScriptElement;
    targetElement.appendChild(script);
    script.src = src;
    return script;
  }

  public static insertStyle(contents: string): void {
    const style = document.createElement(DomMethods.STYLE_MARKUP);
    style.innerHTML = contents;
    document.head.appendChild(style);
  }

  public static isScriptLoaded(name: string): boolean {
    const scripts: HTMLCollection = document.getElementsByTagName(DomMethods.SCRIPT_MARKUP);
    // @ts-ignore
    for (const script of scripts) {
      if (script.getAttribute(DomMethods.SRC_ATTRIBUTE) === name) {
        return true;
      }
    }
    return false;
  }

  public static parseForm(form: HTMLElement): {} {
    const els = this.getAllFormElements(form);
    const result: any = {};
    for (const el of els) {
      if (el.hasAttribute(DomMethods.ST_NAME_ATTRIBUTE)) {
        result[el.getAttribute(DomMethods.ST_NAME_ATTRIBUTE)] = el.value;
      }
    }
    return result;
  }

  public static parseMerchantForm(): {} {
    return this.parseForm(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
  }

  public static removeAllChildren(placement: string): HTMLElement {
    const element: HTMLElement = document.getElementById(placement);
    if (!element) {
      return element;
    }
    while (element.lastChild) {
      element.removeChild(element.lastChild);
    }
    return element;
  }
}

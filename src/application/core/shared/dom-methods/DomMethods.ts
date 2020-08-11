import { IScriptParams } from '../../models/IScriptParams';

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
    ...Array.from(form.querySelectorAll(DomMethods.SELECT_MARKUP)),
    ...Array.from(form.querySelectorAll(DomMethods.INPUT_MARKUP))
  ];

  private static isScriptLoaded(params: IScriptParams): Element {
    const { src, id } = params;
    const scripts: HTMLCollection = document.getElementsByTagName(DomMethods.SCRIPT_MARKUP);
    const scriptById: HTMLElement = document.getElementById(id);
    if (scriptById) {
      return scriptById;
    }
    for (const script of Array.from(scripts)) {
      if (script.getAttribute(DomMethods.SRC_ATTRIBUTE) === src) {
        return script;
      }
    }
  }

  public static insertScript(target: string, params: IScriptParams): Promise<Element> {
    return new Promise((resolve, reject) => {
      const loaded: Element = DomMethods.isScriptLoaded(params);
      if (loaded) {
        resolve(loaded);
      } else {
        const targetElement: Element = document.getElementsByTagName(target)[0];
        const script: Element = DomMethods.setMarkupAttributes(DomMethods.SCRIPT_MARKUP, params);
        targetElement.appendChild(script);
        script.addEventListener('load', () => {
          resolve(script);
        });
      }
    });
  }

  public static insertStyle(contents: string[]): void {
    let style: HTMLStyleElement = document.getElementById('insertedStyles') as HTMLStyleElement;

    if (!style) {
      style = document.createElement(DomMethods.STYLE_MARKUP) as HTMLStyleElement;
      style.setAttribute('id', 'insertedStyles');
      style.setAttribute('type', 'text/css');
      document.head.appendChild(style);
    }
    contents.forEach((item: string) => (style.sheet as CSSStyleSheet).insertRule(item, 0));
  }

  public static parseForm(formId: string): {} {
    const form: HTMLElement = document.getElementById(formId);
    const els = DomMethods.getAllFormElements(form);
    const result: any = {};
    for (const el of els) {
      if (el.hasAttribute(DomMethods.ST_NAME_ATTRIBUTE)) {
        result[el.getAttribute(DomMethods.ST_NAME_ATTRIBUTE)] = el.value;
      }
    }
    return result;
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

  private static setMarkupAttributes(target: string, params: any): Element {
    const element: Element = document.createElement(target) as Element;
    Object.keys(params).forEach((param: string) => {
      // @ts-ignore
      element.setAttribute(param, params[param]);
    });
    return element;
  }
}

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

  public static insertScript(target: string, params: any): Promise<Element> {
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

  public static setProperty(attr: string, value: string, elementId: string) {
    const element = document.getElementById(elementId);
    element.setAttribute(attr, value);
    return element;
  }

  public static insertStyle(contents: string): void {
    const head = document.getElementById('insertedStyles');
    if (head) {
      return;
    }
    const style = document.createElement(DomMethods.STYLE_MARKUP);
    style.setAttribute('id', 'insertedStyles');
    style.setAttribute('type', 'text/css');
    style.innerHTML = contents;
    document.head.appendChild(style);
  }

  public static getIframeContentWindow = (name: string) => (window as any).frames[name];

  public static createHtmlElement = (attributes: any, markup: string) => {
    const element = document.createElement(markup);
    // @ts-ignore
    Object.keys(attributes).map(item => element.setAttribute(item, attributes[item]));
    return element;
  };

  public static appendChildIntoDOM(target: string, child: HTMLElement) {
    const element = document.getElementById(target)
      ? document.getElementById(target)
      : document.getElementsByTagName('body')[0];
    element.appendChild(child);
    return element;
  }

  public static removeChildFromDOM(parentId: string, childId: string) {
    const parent = document.getElementById(parentId);
    const child = document.getElementById(childId);
    if (parent && child) {
      parent.removeChild(child);
      return parent;
    } else {
      return parent;
    }
  }

  public static addListener(targetId: string, listenerType: string, callback: any) {
    document.getElementById(targetId).addEventListener(listenerType, callback);
  }

  public static addClass = (element: HTMLElement, classToAdd: string) => element.classList.add(classToAdd);

  public static removeClass = (element: HTMLElement, classToRemove: string) => element.classList.remove(classToRemove);

  public static parseForm(form: HTMLElement) {
    const els = this.getAllFormElements(form);
    const result: any = {};
    for (const el of els) {
      if (el.hasAttribute('data-st-name')) {
        result[el.getAttribute('data-st-name')] = el.value;
      }
    }
    return result;
  }

  public static parseMerchantForm() {
    return this.parseForm(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
  }

  public static getAllFormElements = (form: HTMLElement) => [
    ...Array.prototype.slice.call(form.querySelectorAll('select')),
    ...Array.prototype.slice.call(form.querySelectorAll('input'))
  ];

  public static addDataToForm(form: HTMLFormElement, data: any, fields?: string[]) {
    Object.entries(data).forEach(([field, value]) => {
      if (!fields || fields.includes(field)) {
        form.appendChild(
          DomMethods.createHtmlElement(
            {
              name: field,
              type: 'hidden',
              value
            },
            'input'
          )
        );
      }
    });
  }

  public static removeAllChildren(placement: string) {
    const element: HTMLElement = document.getElementById(placement);
    if (element) {
      while (element.lastChild) {
        element.removeChild(element.lastChild);
      }
    }
    return element;
  }

  private static isScriptLoaded(params: any): Element {
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

  private static setMarkupAttributes(target: string, params: any): Element {
    const element: Element = document.createElement(target) as Element;
    Object.keys(params).forEach((param: string) => {
      // @ts-ignore
      element.setAttribute(param, params[param]);
    });
    return element;
  }
}

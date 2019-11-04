import Selectors from './Selectors';

/**
 * DomMethods class.
 * Gather all methods which are making operation on DOM
 */
class DomMethods {
  public static insertScript(target: string, src: string) {
    const targetElement = document.getElementsByTagName(target)[0];
    const script = document.createElement('script');
    targetElement.appendChild(script);
    script.src = src;
    return script;
  }

  /**
   * Sets defined property in DOM
   * @param attr
   * @param value
   * @param elementId
   */
  public static setProperty(attr: string, value: string, elementId: string) {
    const element = document.getElementById(elementId);
    element.setAttribute(attr, value);
    return element;
  }

  /**
   * Appends styles to head element.
   * @param contents
   */
  public static insertStyle(contents: string) {
    const style = document.createElement('style');
    style.innerHTML = contents;
    document.head.appendChild(style);
  }

  /**
   * Returns iframe with specified name.
   * @param name
   */
  public static getIframeContentWindow = (name: string) => (window as any).frames[name];

  /**
   * Creates and returns html element.
   * @param attributes
   * @param markup
   */
  public static createHtmlElement = (attributes: any, markup: string) => {
    const element = document.createElement(markup);
    // @ts-ignore
    Object.keys(attributes).map(item => element.setAttribute(item, attributes[item]));
    return element;
  };

  /**
   * Appends HTML element into DOM.
   * @param target
   * @param child
   */
  public static appendChildIntoDOM(target: string, child: HTMLElement) {
    const element = document.getElementById(target)
      ? document.getElementById(target)
      : document.getElementsByTagName('body')[0];
    element.appendChild(child);
    return element;
  }

  /**
   * Removes child from DOM.
   * @param parentId
   * @param childId
   */
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

  /**
   * Adds listener to specified element.
   * @param targetId
   * @param listenerType
   * @param callback
   */
  public static addListener(targetId: string, listenerType: string, callback: any) {
    document.getElementById(targetId).addEventListener(listenerType, callback);
  }

  /**
   * Adds class to inputs classList.
   * @param element
   * @param classToAdd
   */
  public static addClass = (element: HTMLElement, classToAdd: string) => element.classList.add(classToAdd);

  /**
   * Removes class to inputs classList.
   * @param element
   * @param classToRemove
   */
  public static removeClass = (element: HTMLElement, classToRemove: string) => element.classList.remove(classToRemove);

  /**
   * Parse inputs and selects out of a form if the field name is provided in data-st-name attribute
   * Tested by parseForm
   * @param form
   */
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

  /**
   * Convenience method for parsing merchant forms using the merchant form selector
   * Tested by parseForm
   */
  public static parseMerchantForm() {
    return this.parseForm(document.getElementById(Selectors.MERCHANT_FORM_SELECTOR));
  }

  /**
   * Get all form elements out of a form
   * Tested by parseForm
   * @param form
   */
  public static getAllFormElements = (form: HTMLElement) => [
    ...Array.prototype.slice.call(form.querySelectorAll('select')),
    ...Array.prototype.slice.call(form.querySelectorAll('input'))
  ];

  /**
   * Adds form elements to created form.
   * @param form
   * @param data
   * @param fields
   */
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

  /**
   * Delete all child nodes from given target.
   * @param placement
   */
  public static removeAllChildren(placement: string) {
    const element: HTMLElement = document.getElementById(placement);
    if (element) {
      while (element.lastChild) {
        element.removeChild(element.lastChild);
      }
    }
    return element;
  }
}

export default DomMethods;

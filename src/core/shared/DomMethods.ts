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

  public static insertStyle(contents: string) {
    let style = document.createElement('style');
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
    }
    return parent;
  }

  public static addListener(targetId: string, listenerType: string, callback: any) {
    document.getElementById(targetId).addEventListener(listenerType, callback);
  }

  public static addClass = (element: HTMLElement, classToAdd: string) => element.classList.add(classToAdd);
  public static removeClass = (element: HTMLElement, classToRemove: string) => element.classList.remove(classToRemove);
}

export default DomMethods;

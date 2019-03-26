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

  public static getIframeContentWindow = (id: string) =>
    (document.getElementById(id) as HTMLIFrameElement).contentWindow;

  public static createElement = (markup: string) => document.createElement(markup);

  public static setMultipleAttributes = (attributes: any, markup: string) => {
    const element = DomMethods.createElement(markup);
    // @ts-ignore
    Object.keys(attributes).map(item => {
      element.setAttribute(item, attributes[item]);
    });
    return element;
  };
}

export default DomMethods;

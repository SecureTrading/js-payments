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

  public static insertStyle(contents: string) {
    let style = document.createElement('style');
    style.innerHTML = contents;
    document.head.appendChild(style);
  }
}

export default DomMethods;

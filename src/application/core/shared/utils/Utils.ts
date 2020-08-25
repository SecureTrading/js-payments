export class Utils {
  public static inArray<T>(array: ArrayLike<T>, item: T) {
    return Array.from(array).indexOf(item) >= 0;
  }

  public static forEachBreak<inputType, returnType>(
    iterable: ArrayLike<inputType>,
    callback: (item: inputType) => returnType
  ): returnType {
    let result: returnType = null;
    // tslint:disable-next-line:forin
    for (const i in iterable) {
      result = callback(iterable[i]);
      if (result) {
        break;
      }
    }
    return result || null;
  }

  public static timeoutPromise(timeout: number, err = new Error()): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(err), timeout));
  }

  public static promiseWithTimeout<T>(promissory: () => Promise<T>, timeout = 10, err = new Error()): Promise<T> {
    return Promise.race([promissory(), Utils.timeoutPromise(timeout, err)]);
  }

  public static retryPromise<T>(promissory: () => Promise<T>, delay = 0, retries = 5, retryTimeout = 100): Promise<T> {
    return new Promise((resolve, reject) => {
      const endtime = Date.now() + retryTimeout;
      let error: Error;

      function attempt() {
        if (retries > 0 && Date.now() < endtime) {
          promissory()
            .then(resolve)
            .catch(e => {
              retries--;
              error = e;
              setTimeout(() => attempt(), delay);
            });
        } else {
          reject(error);
        }
      }

      attempt();
    });
  }

  public static stripChars(string: string, regex: any) {
    if (typeof regex === 'undefined' || !Boolean(regex)) {
      regex = /[\D+]/g;
      return string.replace(regex, '');
    } else {
      return string.replace(regex, '');
    }
  }

  public static getLastElementOfArray = (array: number[]) => array && array.slice(-1).pop();

  public static setElementAttributes(attributes: any, element: HTMLInputElement) {
    // tslint:disable-next-line: forin
    for (const attribute in attributes) {
      const value = attributes[attribute];
      if (Utils.inArray(['value'], attribute)) {
        // @ts-ignore
        element[attribute] = value;
      } else if (value === false) {
        element.removeAttribute(attribute);
      } else {
        element.setAttribute(attribute, value);
      }
    }
  }
}

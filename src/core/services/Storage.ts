export class Storage {
  /**
   * Sets data to localStorage, previously converts
   * them to string depends on type given.getPaymentSuccessStatus
   * @param name
   * @param data
   */
  public setLocalStorageItem(name: string, data: any) {
    if (data) {
      const type = typeof data;
      const isObject = type === 'object' && type !== null;
      const dataToSet = isObject ? JSON.stringify(data) : data.toString();
      localStorage.setItem(name, dataToSet);
    } else {
      return false;
    }
  }

  /**
   * Sets data to localStorage, previously converts
   * them to string depends on type given.
   * @param name
   * @param storage
   */
  public getLocalStorageItem(name: string, storage: string) {
    if (storage) {
      const json = JSON.parse(storage);
      return Object.keys(json).includes(name) ? json[name] : '';
    } else {
      return false;
    }
  }
}

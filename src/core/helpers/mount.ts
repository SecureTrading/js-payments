import { createFormElement } from './dom';

/**
 * Method for Registering element in specified clients form
 * @param fields
 * @param form
 * @constructor
 */
const RegisterElements = (fields: HTMLElement[], targets: string[]) => {
  const promise1 = new Promise((resolve, reject) => {
    targets.map((item, index) => {
      let obj = document.getElementById(item);
      obj.appendChild(fields[index]);
    });
    resolve('well done !');
    reject('something went wrong :(');
  });
};

export { RegisterElements };

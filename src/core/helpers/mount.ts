/**
 * Method for Registering element in specified clients form
 * @param fields
 * @param targets
 */
const RegisterElements = (fields: HTMLElement[], targets: string[]) => {
  new Promise((resolve, reject) => {
    targets.map((item, index) => {
      let itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
    resolve('Iframes has been succesfully registered!');
    reject('Something went wrong');
  });
};

export { RegisterElements };

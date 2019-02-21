/**
 * Method is appending created iframes into containers specified by merchant
 * @param fields - Iframes ready to mount
 * @param targets - ids of fields created by merchant in which iframes will be insterted
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

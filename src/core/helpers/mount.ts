/**
 * Method is appending created iframes into containers specified by merchant
 * @param fields - Iframes ready to mount
 * @param targets - ids of fields created by merchant in which iframes will be insterted
 */
const RegisterElements = (fields: HTMLElement[], targets: string[]) => {
  targets.map((item, index) => {
    const itemToChange = document.getElementById(item);
    itemToChange.appendChild(fields[index]);
  });
};

export { RegisterElements };

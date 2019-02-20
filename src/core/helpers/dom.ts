/**
 * Method which applies styles from url
 * @param id - ID of desired element which we want to style
 * @param domain - Name of domain from which we get URL
 */
const applyStylesToElement = (id: string, domain: string) => {
  let input = <HTMLInputElement>document.getElementById(id);
  let styles = getStylesFromUrl(domain);
  Object.assign(input.style, styles.style.style.base);
};

/**
 *
 * @param id Id of element
 * @param attribute Attribute content
 */
const addAttributeToElement = (id: string, attribute: any) => {
  let element = <HTMLInputElement>document.getElementById(id);
  element.setAttribute(id, attribute);
};

/**
 * Method for creating DOM elements
 * @param type Type of element which we are creating
 * @param id ID of element
 * @param text Optional text for element
 */
const createFormElement = (type: string, id: string, text?: string) => {
  const element = document.createElement(type);
  element.setAttribute('id', id);
  element.setAttribute('class', id);
  element.innerHTML = text ? text : '';
  return element;
};

/**
 * Method for getting object - styles from url
 * @param domain Domain from which we get styles
 */
const getStylesFromUrl = (domain: string) => {
  let query = window.location.href;
  query = decodeURI(query)
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
    .replace(domain, '');
  return JSON.parse(query);
};

export { addAttributeToElement, createFormElement, applyStylesToElement };

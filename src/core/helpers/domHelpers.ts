const applyStylesToElement = (id: string, endpoint: string) => {
  let input = <HTMLInputElement>document.getElementById(id);
  let styles = getStylesFromUrl(endpoint);
  Object.assign(input.style, styles.style.style.base);
};

const createFormElement = (type: string, id: string, text?: string) => {
  const element = document.createElement(type);
  element.setAttribute('id', id);
  element.setAttribute('class', id);
  element.innerHTML = text ? text : '';
  return element;
};

const getStylesFromUrl = (endpoint: string) => {
  let query = window.location.href;
  query = decodeURI(query)
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
    .replace(endpoint, '');
  return JSON.parse(query);
};

export { createFormElement, applyStylesToElement };

const createFormElement = (type: string, id: string, text?: string) => {
  const element = document.createElement(type);
  element.setAttribute('id', id);
  element.setAttribute('class', id);
  element.innerHTML = text ? text : '';
  return element;
};

export { createFormElement };

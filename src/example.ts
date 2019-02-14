/***
 *  Here will be all function just for initializing examples
 */

const createElement = () => {
  const element = document.createElement('form');
  element.setAttribute('id', 'st-form');
  document.body.appendChild(element);
};

export { createElement };

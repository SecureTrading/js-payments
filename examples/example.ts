const createFormElement = (type: string, id: string, text?: string) => {
  const element = document.createElement(type);
  element.setAttribute('id', id);
  element.setAttribute('class', id);
  element.innerHTML = text ? text : '';
  return element;
};
const elementStyles = {
  style: {
    base: {
      color: '#495057',
      fontFamily: 'Montserrat, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      fontWeight: 700,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      borderColor: '#ced4da',
      padding: '6px 12px 6px 20px',
      lineHeight: '1.5',
      backgroundColor: '#fff',
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  invalid: {
    color: '#fff',
    ':focus': {
      color: '#FA755A',
    },
    '::placeholder': {
      color: '#FFCCA5',
    },
  },
};
const elementClasses = {
  focus: 'focus',
  empty: 'empty',
  invalid: 'invalid',
};

export { createFormElement, elementStyles, elementClasses };

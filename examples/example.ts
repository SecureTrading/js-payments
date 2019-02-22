const elementStyles = {
  style: {
    invalid: {
      color: '#fff',
      '::placeholder': {
        color: '#FFCCA5',
      },
      ':focus': {
        color: '#FA755A',
      },
    },
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
};
const elementClasses = {
  focus: 'focus',
  empty: 'empty',
  invalid: 'invalid',
};

export { elementStyles, elementClasses };

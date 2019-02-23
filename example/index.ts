const elementStyles = {
  style: {
    base: {
      backgroundColor: '#fff',
      border: '.1rem solid #ced4da',
      borderRadius: '.4rem',
      color: '#495057',
      fontFamily: 'Montserrat, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      fontWeight: 700,
      lineHeight: '1.5',
      padding: '6px 12px 6px 20px'
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};
const elementClasses = {
  empty: 'empty',
  focus: 'focus',
  invalid: 'invalid'
};

export { elementStyles, elementClasses };

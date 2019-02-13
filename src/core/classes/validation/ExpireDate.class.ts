import Validation from './Validation.class';

class ExpireDate extends Validation {
  constructor() {
    super();
  }

  dateInputMask(element: HTMLInputElement) {
    element.addEventListener('keyup', (event: any) => {
      let length = element.value.length;
      if (length < 5) {
        if (event.keyCode < 47 || event.keyCode > 57) {
          event.preventDefault();
        }

        if (length === 0) {
          if (event.keyCode !== 48 && event.keyCode !== 49) {
            event.preventDefault();
          }
        }

        if (length !== 1) {
          if (event.keyCode == 47) {
            event.preventDefault();
          }
        }

        if (length === 2) {
          element.value += '/';
        }
      } else {
        event.preventDefault();
      }
    });
  }
}

export default ExpireDate;

import Validation from './Validation.class';

class ExpireDate extends Validation {
  constructor() {
    super();
  }

  isSelectEmpty(id: string) {
    let input = document.getElementById(id);
    input.addEventListener('onselect', event => {
      console.log(event);
    });
  }
}

export default ExpireDate;

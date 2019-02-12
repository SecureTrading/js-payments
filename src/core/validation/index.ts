import { getInfo, creditCardValidation, getCardLogo } from './cards/cards';

export const removeError = (field: any) => {
  field.classList.remove('st-error');
  field.removeAttribute('aria-describedby');

  let id = field.id || field.name;
  if (!id) {
    return;
  }

  let message = field.form.querySelector(
    `.st-error-message#st-error-for-${id}`
  );
  if (!message) {
    return;
  }

  message.innerHTML = '';
  message.style.display = 'none';
  message.style.visibility = 'hidden';
};

export let hasError = (field: any) => {
  if (
    field.disabled ||
    field.type === 'file' ||
    field.type === 'reset' ||
    field.type === 'submit' ||
    field.type == 'button'
  ) {
    return;
  }

  let validity = field.validity;
  if (validity.valid) {
    return;
  }
  if (validity.valueMissing) {
    return 'Pole jest wymagane';
  }
  if (validity.typeMismatch) {
    if (field.type === 'email') {
      return 'Please enter an email address.';
    }
    if (field.type === 'url') {
      return 'Please enter a URL.';
    }
  }
  if (validity.tooShort) {
    return `Podane wyrażenie musi mieć min ${field.getAttribute(
      'minLength'
    )} znaków, wprowadziłeś: ${field.value.length}`;
  }
  if (validity.tooLong) {
    return 'Podany tekst jest za długi ';
  }
  if (validity.badInput) {
    return 'Podane wyrażenie nie jest liczbą';
  }
  if (validity.stepMismatch) {
    return 'Wybierz poprawną wartość';
  }
  if (validity.rangeOverflow) {
    return 'Wybierz mniejszą wartość';
  }
  if (validity.rangeUnderflow) {
    return 'Wybierz wiekszą wartość';
  }
  if (validity.patternMismatch) {
    return 'Format wyrażenia jest niezgodny';
  }
  return 'Wystąpił bliżej nieokreślony błąd :)';
};

export const showError = (field: any, error: any) => {
  field.classList.add('st-error');

  let id = field.id || field.name;
  if (!id) {
    return;
  }

  let message = field.form.querySelector(
    `.st-error-message#st-error-for-${id}`
  );

  if (!message) {
    message = document.createElement('div');
    message.className = 'st-error-message';
    message.id = 'st-error-for-' + id;
    field.parentNode.insertBefore(message, field.nextSibling);
  }

  field.setAttribute('aria-describedby', 'st-error-for-' + id);
  message.innerHTML = error;
  message.style.display = 'block';
  message.style.visibility = 'visible';
};

document.addEventListener(
  'blur',
  (event: Event) => {
    // @ts-ignore
    if (!event.target.form.classList.contains('st-form')) {
      return;
    }
    // @ts-ignore
    let error = hasError(event.target);
    // @ts-ignore
    error ? showError(event.target, error) : error(event.target);
  },
  true
);

(function() {
  let cardNo = document.getElementById('st-card-number');

  // @ts-ignore
  cardNo.addEventListener('input', ({ target: { value } }) => {
    const cardInfo = getInfo(value);
    const cardLogo = getCardLogo(cardInfo.type);
    document.getElementById('st-card-logo').setAttribute('src', cardLogo);
  });

  document.addEventListener(
    'submit',
    (event: any) => {
      if (event.target.classList.contains('validate')) {
        return;
      }
      event.preventDefault();

      let fields = event.target.elements;

      var error, hasErrors;

      for (let i = 0; i < fields.length; ++i) {
        error = hasError(fields[i]);

        if (error) {
          showError(fields[i], error);
          if (!hasErrors) {
            hasErrors = fields[i];
          }
        }
      }

      if (hasErrors) {
        event.preventDefault();
        hasErrors.focus();
      }
    },
    false
  );
})();

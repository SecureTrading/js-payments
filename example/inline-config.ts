window.addEventListener('load', () => {
  const additionalButtonId: string = 'additional-button';
  const submitButtonId: string = 'merchant-submit-button';
  const formId: string = 'st-form';
  const params = new URLSearchParams(window.location.search.substring(1));
  const formIdValue = params.get('formId');
  const noSubmitButton = params.get('noSubmitButton');
  const additionalButtonValue = params.get('additionalButton');
  if (noSubmitButton === 'true') {
    document.getElementById(submitButtonId).setAttribute('hidden', 'hidden');
  }

  if (formIdValue) {
    document.getElementById(formId).setAttribute('id', formIdValue);
  }

  if (additionalButtonValue === 'true') {
    document.getElementById(additionalButtonId).removeAttribute('hidden');
  }
});

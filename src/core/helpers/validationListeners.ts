const returnErrorMessage = (errors: any) => {
  if (errors.isEmpty) {
    return 'Field is empty';
  }
};

const submitListener = () => {
  document.addEventListener('submit', event => {
    event.preventDefault();
    let iframe = document.getElementById('st-card-number') as HTMLIFrameElement;
    let iframeContent = iframe.contentWindow;
    iframeContent.postMessage('This is test message', 'http://localhost:8081/');
  });

  window.addEventListener('message', event => {
    if (event.origin !== 'http://localhost:8080') {
      document.getElementById(
        'received-message'
      ).textContent = returnErrorMessage(event.data);
    }
  });
};

export { submitListener };

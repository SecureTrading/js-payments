const returnErrorMessage = (errors: any) => {
  if (errors.isEmpty) {
    return 'Pole jest puste';
  }
};

const submitListener = () => {
  document.addEventListener('submit', (event) => {
    event.preventDefault();
    let iframe = document.getElementById('st-card-number') as HTMLIFrameElement;
    // @ts-ignore
    iframe = iframe.contentWindow;
    // @ts-ignore
    iframe.postMessage('This is test message', 'http://localhost:8081/');
  });

  window.addEventListener('message', (event) => {
    if (event.origin !== 'http://localhost:8080') {
      document.getElementById('received-message').textContent = returnErrorMessage(event.data);
    }
  });
};

export { submitListener };

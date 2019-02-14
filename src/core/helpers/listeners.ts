const submitListener = () => {
  document.addEventListener('submit', (event) => {
    event.preventDefault();
    let iframe = document.getElementById('st-card-number') as HTMLIFrameElement ;
    // @ts-ignore
    iframe = iframe.contentWindow;
    // @ts-ignore
    iframe.postMessage('This is test message', 'http://localhost:8081/');
  });
};

export { submitListener };

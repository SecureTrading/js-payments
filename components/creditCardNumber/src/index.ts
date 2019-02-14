import './style.css';

window.addEventListener('message', (event) => {
  if (event.origin !== 'http://localhost:8081') {
    // @ts-ignore
    event.source.postMessage('hi there yourself!  the secret response ' + 'is: rheeeeet!', event.origin);
    alert(event.origin);
  }
}, true);

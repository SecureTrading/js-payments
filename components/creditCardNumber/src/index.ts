import './style.css';

window.addEventListener('message', (event) => {
  if (event.origin !== 'http://localhost:8081') {
    // @ts-ignore
    event.source.postMessage('hi there yourself!  the secret response ' + 'is: rheeeeet!', event.origin);
    alert(event.origin);
  }
}, true);

// very ugly algorithm for extracting styles from url
document.addEventListener('DOMContentLoaded', () => {
  let query = window.location.search;
  let params = query.split('style');
  let modified = params.map((item) => item.split('[').join(''));
  modified = modified.map((item) => item.split(']').join(''));
  modified = modified.map((item) => item.split('&').join(''));
  modified = modified.map((item) => item.split('?').join(''));
  modified = modified.map((item) => item.split('%22').join(''));
  modified = modified.map((item) => item.split('=').join(':'));
  const element = document.getElementById('credit-card-number').style;
  modified.shift();
  modified = { ...modified };
  console.log(modified);
  let modified1 = Object.values(modified).map((prev) => {
    // @ts-ignore
    return {...prev.split(':')};
  });
  console.log(modified1);
});

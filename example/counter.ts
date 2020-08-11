let callbackCounter: number = 0;
let submitCallbackCounter: number = 0;
const popupStyles: string =
  'display: flex; justify-content: center; position: fixed; left: 0; height: 70px; width: 280px;right:0;color: white;padding: 0 40px;align-items: center;border-radius: 10px;font-family: Verdana;font-size: 20px;z-index:2';
const popup = document.getElementById('st-popup');
const div = document.createElement('div');

// @ts-ignore
window.displayCallbackCounter = (id: string, text: string, tp: string) => {
  callbackCounter += 1;
  if (id === 'submit-callback-counter') {
    submitCallbackCounter += 1;
    div.innerText = `${text} Callback counter: ${submitCallbackCounter}`;
  } else {
    div.innerText = `${text} Callback counter: ${callbackCounter}`;
  }
  div.setAttribute('id', id);
  div.setAttribute('style', popupStyles);
  div.style.backgroundColor = tp;
  switch (tp) {
    case 'blue':
      div.style.top = '150px';
      break;
    default:
      div.style.top = '250px';
  }
  popup.appendChild(div);
  setTimeout(() => {
    popup.removeChild(div);
  }, 5000);
};

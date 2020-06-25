import './style.scss';

import { jwtgenerator } from '@securetrading/jwt-generator';
import { payload, secret, iss } from './json/jwtdata.json';

function getJwt() {
  return jwtgenerator(payload, secret, iss);
}

function getConfig(url: string) {
  return window
    .fetch(url)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject('Configuration has not been set !');
      }
      return response.json();
    })
    .then(data => data)
    .catch(() => fetchDefaultConfig());
}

function fetchDefaultConfig() {
  fetch('./../json/config.json')
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject('Default configuration has not been set !');
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        return data;
      }
    });
}

function displayPopup(id: string, text: string, tp: string) {
  if (!document.getElementById(id)) {
    const div = document.createElement('div');
    div.innerText = text;
    div.setAttribute('id', id);
    div.setAttribute(
      'style',
      'display: flex; justify-content: center; position: fixed; height: 70px;right:0;color: white;padding: 0 50px;align-items: center;border-radius: 10px;font-family: Verdana;font-size: 20px;z-index:2'
    );
    div.style.backgroundColor = tp;
    if (tp === 'green') {
      // @ts-ignore
      div.style.top = 0;
    } else {
      // @ts-ignore
      div.style.bottom = 0;
    }
    const popup = document.getElementById('st-popup');
    popup.appendChild(div);
    setTimeout(() => {
      popup.removeChild(div);
    }, 3000);
  }
}

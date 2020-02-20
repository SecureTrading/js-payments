import { Service } from 'typedi';
import { AbstractStorage } from './AbstractStorage';

@Service()
export class BrowserSessionStorage extends AbstractStorage {
  constructor() {
    super(window.sessionStorage);
  }
}

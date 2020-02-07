import { Token } from 'typedi';
import { IConfig } from '../config/model/IConfig';

export const CONFIG = new Token<IConfig>();

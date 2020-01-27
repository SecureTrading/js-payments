import { Token } from 'typedi';
import { IConfig } from '../models/IConfig';

export const CONFIG = new Token<IConfig>();

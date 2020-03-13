import { Token } from 'typedi';
import { IConfig } from '../../../shared/model/config/IConfig';

export const CONFIG = new Token<IConfig>();
export const WINDOW = new Token<Window>();

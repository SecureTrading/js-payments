import { IApm } from '../models/IApm';

export abstract class Apm implements IApm {
  protected constructor() {}

  abstract getConfig(): void;

  abstract updateJwtListener(): void;
}

import { IApm } from '../models/IApm';

export abstract class Apm implements IApm {
  protected constructor() {}

  abstract init(): void;

  abstract updateJwtListener(): void;
}

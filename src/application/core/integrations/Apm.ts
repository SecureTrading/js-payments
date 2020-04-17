import { IApm } from '../models/IApm';

export abstract class Apm implements IApm {
  protected constructor() {}

  init(): void {
    console.error('init');
  }

  loadSdk(): void {
    console.error('loadSdk(');
  }

  onCancel(): void {
    console.error('onCancel');
  }

  onError(): void {
    console.error('init');
  }
}

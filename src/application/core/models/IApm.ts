export interface IApm {
  init(): void;

  loadSdk(): void;

  onCancel(): void;

  onError(): void;
}

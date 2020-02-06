export interface IStorage {
  readonly ready: Promise<void>;
  getItem(name: string): string;
  setItem(name: string, value: string): void;
}

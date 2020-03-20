export interface IStorage {
  getItem(name: string): string;
  setItem(name: string, value: string): void;
}

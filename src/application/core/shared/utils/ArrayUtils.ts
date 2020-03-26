export class ArrayUtils {
  public static unique<T>(array: T[]): T[] {
    return Array.from(new Set(array).values());
  }

  public static equals(a: any[], b: any[]): boolean {
    return a.length === b.length && JSON.stringify(a) === JSON.stringify(b);
  }
}

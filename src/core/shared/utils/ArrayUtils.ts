export class ArrayUtils {
  public static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  public static equals(a: any[], b: any[]): boolean {
    return a.length === b.length && JSON.stringify(a) === JSON.stringify(b);
  }
}

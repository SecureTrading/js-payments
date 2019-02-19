/**
 * Test if item is in array
 * @param array An array of items
 * @param item the item to test for
 * @return Boolean whether 
 */
export function inArray<T>(array: ArrayLike<T>, item: T) {
  return Array.from(array).indexOf(item) >= 0;
}

/**
 * This is a custom implementation of Array.some which also works for objects
 * When it breaks it returns the first truthy response rather than boolean (unlike some implementations of Array.some)
 * @param iterable The iterable to iterate over
 * @param callback A callback function to find the result
 * @return The first non-falsy return value of the callback function or null
 */
export function forEachBreak<inputType, returnType>(
  iterable: ArrayLike<inputType>,
  callback: (item: inputType) => returnType
): returnType {
  let result: returnType = null;
  for (const i in iterable) {
    result = callback(iterable[i]);
    if (result) {
      break;
    }
  }
  return result || null;
}

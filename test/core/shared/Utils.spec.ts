import each from 'jest-each';
import Utils from '../../../src/core/shared/Utils';

each([
  [[], '', false],
  [[''], '', true],
  [['1'], 1, false],
  [[1], '1', false],
  [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 9, true],
  ['30-31', '-', true]
]).test('utils.inArray', (array, item, expected) => {
  expect(Utils.inArray(array, item)).toBe(expected);
});

each([
  [[], null, 0],
  [[0, 0, 0, 0], null, 4], // if we don't get a truthy result we iterate the whole length
  [[0, 0, 4, 6], 4, 3], // short circuits after the first truthy result
  [[null, null, 4, 6], 4, 3], // this is more like what we do in _lookup
  [{ 0: 0, 1: 0, 2: 4, 3: 6 }, 4, 3] // behaves like return Object.values(iterable).some(callback)
]).test('utils.forEachBreak', (iterable, expected, timesCalledBack) => {
  const callback = jest.fn(
    (item: any): any => {
      return item;
    }
  );
  expect(Utils.forEachBreak(iterable, callback)).toBe(expected);
  expect(callback).toHaveBeenCalledTimes(timesCalledBack);
});

describe('timeoutPromise', () => {
  each([[Error()], [Error('Communication timeout')]]).it('should reject with the specified error', async error => {
    await expect(Utils.timeoutPromise(0, error)).rejects.toThrow(error);
  });

  each([[500], [10]]).it('should reject after the specified time', async timeout => {
    const before = Date.now();
    let after = before;
    await Utils.timeoutPromise(timeout).catch(e => (after = Date.now()));
    // toBeCloseTo is intended to check N significant figures of floats
    // but by using -2 we can check it's within 50ms of the set value
    expect(after - before).toBeCloseTo(timeout, -2);
  });
});

describe('promiseWithTimeout', () => {
  each([[{}, '42']]).it("should resolve with the promissory's value if it finishes first", async value => {
    function promissory() {
      return new Promise(resolve => resolve(value));
    }

    await expect(Utils.promiseWithTimeout(promissory)).resolves.toEqual(value);
  });

  each([[Error(), Error('Communication timeout')]]).it(
    "should reject with the promissory's error if it finishes first",
    async err => {
      function promissory() {
        return new Promise((_, reject) => reject(err));
      }

      await expect(Utils.promiseWithTimeout(promissory)).rejects.toEqual(err);
    }
  );

  it('should reject with the timeout if it times out', async () => {
    const err = new Error('Timeout error');
    await expect(Utils.promiseWithTimeout(() => Utils.timeoutPromise(5), 2, err)).rejects.toEqual(err);
  });
});

describe('retryPromise', () => {
  each([[0], [1]]).it('should resolve as soon as the first promise does so', async rejects => {
    const value = {};
    let promises = rejects;
    const promissory = jest.fn(() => {
      if (promises > 0) {
        promises--;
        return Promise.reject();
      }
      return new Promise(resolve => resolve(value));
    });
    await expect(Utils.retryPromise(promissory)).resolves.toEqual(value);
    expect(promissory).toHaveBeenCalledTimes(rejects + 1);
  });

  each([[10, 5, 1, Error('Connection timeout')], [900, 1, 1, Error('Retry')], [1000, 5, 5, Error('Retries')]]).it(
    'should reject with the last error after max retries or time',
    async (timeout, attempts, expected, error) => {
      const promissory = jest.fn(() => Utils.timeoutPromise(10, error));
      await expect(Utils.retryPromise(promissory, 0, attempts, timeout)).rejects.toThrow(error);
      expect(promissory.mock.calls.length).toBe(expected);
    }
  );
});

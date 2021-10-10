import { diffCheck } from '../index'

describe('lines control', () => {
  test('shoul return true', () => {
    expect(diffCheck()).toBe(true);
  });
});

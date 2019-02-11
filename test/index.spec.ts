// given
describe('Index placeholder test', () => {
  let testVar: boolean;

  //when
  beforeEach(() => {
    testVar = true;
  });

  //then
  it('should return true', () => {
    expect(testVar).toBe(true);
  });
});

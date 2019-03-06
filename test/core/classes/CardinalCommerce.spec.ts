import CardinalCommerce from './../../../src/core/classes/CardinalCommerce.class';

const globalAny: any = global;
globalAny.Cardinal = {
  configure: jest.fn()
};

// given
describe('Class CCIntegration', () => {
  let ccIntegration: any;

  beforeEach(() => {});
  // given
  describe('Method _setConfiguration', () => {
    // then
    it('should be called once', () => {});
  });

  // given
  describe('Method _onPaymentSetupComplete', () => {
    // then
    it('should be called once', () => {});
  });

  // given
  describe('Method _onPaymentValidation', () => {
    // then
    it('should be called once', () => {});
  });

  // given
  describe('Method _onSetup', () => {
    // then
    it('should be called once', () => {});
  });

  // given
  describe('Method _retrieveValidationData', () => {
    // then
    beforeEach(() => {
      const { jwt } = CardinalCommerceFixture();
      document.body.innerHTML = `<input id='JWTContainer' value="${jwt}" />`;
      const instance = new CardinalCommerce();
    });
    it('should be called once', () => {});
  });
});

function CardinalCommerceFixture() {
  const validationData: object = {
    ActionCode: 'ERROR',
    ErrorDescription: 'Invalid JWT. Error verifying and deserialize JWT.',
    ErrorNumber: 1020,
    Validated: false
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI1YzEyODg0NWMxMWI5MjIwZGMwNDZlOGUiLCJpYXQiOjE1NTE4NzM2MDAsImp0aSI6IjQ2LWU';

  return { jwt, validationData };
}

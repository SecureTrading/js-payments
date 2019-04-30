import CardinalCommerce from '../../../src/core/integrations/CardinalCommerce';

// given
describe('Class CCIntegration', () => {
  let instance: any;
  let { jwt, validationData } = CardinalCommerceFixture();

  // when
  beforeEach(() => {
    document.body.innerHTML = `<input id='JWTContainer' value="${jwt}" />`;
    instance = new CardinalCommerce();
  });

  // given
  describe('Method _3DInitRequest', () => {
    // then
    let sendRequestSpy: any;
    let threedeinitRequest;
    beforeEach(() => {
      sendRequestSpy = jest.spyOn(instance, 'sendRequest');
      threedeinitRequest = instance._3DInitRequest();
    });
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

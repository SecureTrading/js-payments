const jwt = {
  jti: 'a5a59bfb-ac06-4c5f-be5c-351b64ae608e',
  iat: 1448997865,
  iss: '56560a358b946e0c8452365ds',
  OrgUnitId: '565607c18b946e058463ds8r',
  Payload: {
    OrderDetails: {
      OrderNumber: '0e5c5bf2-ea64-42e8-9ee1-71fff6522e15',
      Amount: '1500',
      CurrencyCode: '840'
    }
  },
  ObjectifyPayload: true,
  ReferenceId: 'c88b20c0-5047-11e6-8c35-8789b865ff15',
  exp: 1449001465,
  ConfirmUrl: 'https://securetrading.com/confirmHandler'
};

const Cardinal = (window as any).Cardinal;

class CCIntegration {
  constructor() {
    CCIntegration.setConfiguration();
    CCIntegration.onPaymentSetupComplete();
    CCIntegration.onSetup();
  }

  /**
   * Method for passing configuration object
   */
  private static setConfiguration() {
    Cardinal.configure({ logging: { level: 'on' } });
  }

  /**
   * Method on succesfull initialization after calling Cardinal.setup()
   */
  private static onPaymentSetupComplete() {
    Cardinal.on('payments.setupComplete', function(setupCompleteData: any) {
      console.log(setupCompleteData);
    });
  }

  private static onPaymentValidation() {
    Cardinal.on('payments.validated', (data: any, jwt: any) => {
      switch (data.ActionCode) {
        case 'SUCCESS':
          // Handle successful transaction, send JWT to backend to verify
          break;

        case 'NOACTION':
          // Handle no actionable outcome
          break;

        case 'FAILURE':
          // Handle failed transaction attempt
          break;

        case 'ERROR':
          // Handle service level error
          break;
      }
    });
  }

  /**
   * Setup method with given JWT passed from backend
   */
  private static onSetup() {
    Cardinal.setup('init', {
      jwt: jwt
    });
  }
}

export default CCIntegration;

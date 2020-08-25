import { IConfig } from '../../src/shared/model/config/IConfig';

// given
describe('Testing app for different requestTypes', () => {
  // when
  const config: IConfig = {
    jwt: 'somejwt',
    components: {
      requestTypes: []
    }
  };

  // then
  it('should return full list of requestTypes', () => {});
});

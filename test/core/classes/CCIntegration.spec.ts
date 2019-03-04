import { jestPreset } from 'ts-jest';
import CCIntegration from './../../../src/core/classes/CCIntegration.class';
import Cardinal from '../../../src/core/imports/cardinalLibrary';

jest.mock('../../../src/core/imports/cardinalLibrary');

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
});

function CCIntegrationFixture() {
  let Cardinal: any;
  Cardinal = {
    configure: jest.fn()
  };
  return { Cardinal };
}

import RegisterFrames from '../../../src/core/classes/RegisterFrames.class';

// given
describe('RegisterFrames', () => {
  // given
  describe('onInit', () => {
    const { instance } = registerFramesFixture();
    // when
    beforeEach(() => {
      // @ts-ignore
      instance.registerElements = jest.fn();
      // @ts-ignore
      instance.onInit();
    });
    // then
    it('should call registerElements method with elementsToRegister and elementsTargets', () => {
      // @ts-ignore
      expect(instance.registerElements).toHaveBeenCalledWith([], []);
    });
  });
  // given
  describe('registerElements', () => {
    const {
      instance,
      fields,
      targets,
      cardNumberField,
      expirationDateField,
      securityCodeField
    } = registerFramesFixture();

    //when
    beforeEach(() => {
      // @ts-ignore
      instance.registerElements(fields, targets);
    });
    // then
    it('should map targets in merchant form and injects fields', () => {
      expect(document.getElementById('st-card-number').querySelector('#cardNumber')).toEqual(cardNumberField);
      expect(document.getElementById('st-expiration-date').querySelector('#expirationDate')).toEqual(
        expirationDateField
      );
      expect(document.getElementById('st-security-code').querySelector('#securityCode')).toEqual(securityCodeField);
    });
  });
  // given
  describe('setElementsFields', () => {
    const { instance } = registerFramesFixture();
    // then
    it('should return an empty array as preparation for children classes', () => {
      // @ts-ignore
      expect(instance.setElementsFields()).toEqual([]);
    });
  });
});

function registerFramesFixture() {
  const form =
    '<form><div id="st-card-number"></div><div id="st-expiration-date"></div><div id="st-security-code"></div></form>';
  document.body.innerHTML = form;
  const animatedCard: boolean = true;
  const componentsIds = {};
  const cardNumberField = document.createElement('input');
  const expirationDateField = document.createElement('input');
  const securityCodeField = document.createElement('input');
  cardNumberField.setAttribute('id', 'cardNumber');
  expirationDateField.setAttribute('id', 'expirationDate');
  securityCodeField.setAttribute('id', 'securityCode');
  const fields: HTMLElement[] = [cardNumberField, expirationDateField, securityCodeField];
  const targets = ['st-card-number', 'st-expiration-date', 'st-security-code'];
  const jwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTYyODU0NjQ3LjgyNTUyMTIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjEwMDAiLCJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJzaXRlcmVmZXJlbmNlIjoidGVzdDEiLCJsb2NhbGUiOiJlbl9HQiJ9fQ.vqCAI0quQ2oShuirr6iRGNgVfv2YsR_v3Q9smhVx5PM';
  const origin = 'https://example.com';
  const styles = {
    'background-color-input': 'AliceBlue',
    'background-color-input-error': '#f8d7da',
    'color-input-error': '#721c24',
    'font-size-input': '12px',
    'line-height-input': '12px'
  };
  const instance = new RegisterFrames(jwt, origin, componentsIds, styles, animatedCard);
  return { instance, fields, targets, cardNumberField, securityCodeField, expirationDateField };
}

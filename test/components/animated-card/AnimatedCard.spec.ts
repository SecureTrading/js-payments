import each from 'jest-each';
import MessageBus from '../../../src/core/shared/MessageBus';
import Selectors from '../../../src/core/shared/Selectors';
import { cardsLogos } from '../../../src/components/animated-card/animated-card-logos';
import AnimatedCard from './../../../src/components/animated-card/AnimatedCard';
import { Translator } from '../../../src/core/shared/Translator';
// given
describe('Class AnimatedCard', () => {
  // given
  describe('Method ifCardExists', () => {
    // then
    beforeAll(() => {
      const { html } = animatedCardFixture();
      document.body.innerHTML = html;
    });

    it('should return HTMLInput element', () => {
      expect(AnimatedCard.ifCardExists()).toBeTruthy();
    });
  });

  // given
  describe('Method setLabels', () => {
    const { instance } = animatedCardFixture();
    // then
    it('should have set label text', () => {
      instance.setLabels();
      let card = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_LABEL);
      let expiry = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_LABEL);
      let secCode = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_LABEL);
      expect(card.innerHTML).toEqual('Card number');
      expect(expiry.innerHTML).toEqual('Expiration date');
      expect(secCode.innerHTML).toEqual('Security code');
      // @ts-ignore
      instance._translator = new Translator('fr_FR');
      instance.setLabels();
      expect(card.innerHTML).toEqual('Numéro de carte');
      expect(expiry.innerHTML).toEqual("Date d'expiration");
      expect(secCode.innerHTML).toEqual('Code de sécurité');
    });
  });

  // given
  describe('Method returnThemeClass', () => {
    const { cardTypes, instance } = animatedCardFixture();
    // then
    each(cardTypes).it('should return proper name of class specified in parameter', (name: string) => {
      expect(instance.returnThemeClass(name)).toEqual(`st-animated-card__${name}`);
    });
  });

  // given
  describe('Method resetTheme', () => {
    // given
    let { instance } = animatedCardFixture();
    const defaultFrontPageClassSet = `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`;
    const defaultBackPageClassSet = `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`;

    beforeEach(() => {
      instance.resetTheme();
    });
    // then
    it('should reset front page of card to default theme', () => {
      expect(instance.animatedCardFront.getAttribute('class')).toEqual(defaultFrontPageClassSet);
    });

    // then
    it('should reset back page of card to default theme', () => {
      expect(instance.animatedCardBack.getAttribute('class')).toEqual(defaultBackPageClassSet);
    });
  });

  // given
  describe('Method setThemeClasses', () => {
    // when
    let { instance, themeObjects } = animatedCardFixture();

    // then
    each(themeObjects).it('should set proper classes for front page of card', themeObject => {
      instance.setThemeClasses();
      expect(instance.animatedCardFront.classList.contains(themeObject.type));
    });

    // then
    each(themeObjects).it('should set proper classes for back page of card', themeObject => {
      instance.setThemeClasses();
      expect(instance.animatedCardBack.classList.contains(themeObject.type));
    });
  });

  // given
  describe('Method onCardNumberChanged', () => {
    // when
    let { instance, inputValues } = animatedCardFixture();

    // then
    it('should set card number if it is requested to change', () => {
      instance.cardDetails.cardNumber = inputValues.cardNumber;
      // instance.onCardNumberChanged({type});
      // expect(instance.animatedCardPan.textContent).toEqual(inputValues.cardNumber);
    });
  });

  // given
  describe('Method onExpirationDateChanged', () => {
    // when
    let { instance } = animatedCardFixture();
    let dataObject = {
      value: '',
      validity: false
    };
    beforeEach(() => {
      dataObject.value = '11/12';
    });

    // then
    it('should set expiration date if it is requested to change', () => {
      instance.onExpirationDateChanged(dataObject);
      expect(instance.cardDetails.expirationDate).toEqual(dataObject.value);
    });
  });

  // given
  describe('Method shouldFlipCard', () => {
    // when
    let { instance, cardTypes } = animatedCardFixture();

    // then
    each(cardTypes).it('should flip card if it is requested', (type: string) => {
      const spy = jest.spyOn(instance, 'flipCard');
      instance.shouldFlipCard();
      expect(spy).toHaveBeenCalledTimes(1);
      instance.flipCardBack();
    });
    it('should not flip card if it is on no flipped list', () => {
      const spy = jest.spyOn(instance, 'flipCard');
      instance.cardDetails.type = 'AMEX';
      instance.shouldFlipCard();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('Method flipCard', () => {
    // when
    let { instance } = animatedCardFixture();

    // then
    it(`should add ${AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION} class to element`, () => {
      instance.flipCard();
      expect(instance.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION));
    });
  });

  // given
  describe('Method flipCardBack', () => {
    // when
    let { instance, cardTypes } = animatedCardFixture();

    // then
    each(cardTypes).it(`should flip back card`, (type: string) => {
      instance.cardDetails.type = type;
      instance.flipCardBack();
      expect(instance.cardElement.getAttribute('class')).toEqual(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    });
  });

  // given
  describe('Method _setDefaultInputsValues', () => {
    let { instance } = animatedCardFixture();
    // then
    it(`should set card number on start with value: ${AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER}`, () => {
      instance.setDefaultInputsValues();
      expect(instance.animatedCardPan.textContent).toEqual(AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER);
    });

    // then
    it(`should set expiration date on start with value: ${
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    }`, () => {
      instance.setDefaultInputsValues();
      expect(instance.animatedCardExpirationDate.textContent).toEqual(
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
      );
    });

    // then
    it(`should set security code on start with value: ${AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE}`, () => {
      instance.setDefaultInputsValues();
      expect(instance.animatedCardSecurityCode.textContent).toEqual(
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
      );
    });
  });
  describe('Method setSubscribeEvents', () => {
    const functionCalls = 1;
    let instance: any;
    beforeEach(() => {
      instance = animatedCardFixture().instance;
    });
    // then
    it(`should onCardNumberChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, 'onCardNumberChanged');
      instance.animatedCardPan.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });

    // then
    it(`should onExpirationDateChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, 'onExpirationDateChanged');
      instance.animatedCardExpirationDate.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });

    // then
    it(`should onSecurityCodeChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, 'onSecurityCodeChanged');
      instance.animatedCardSecurityCode.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });
  });
});

function animatedCardFixture() {
  const html =
    '<div class="st-animated-card" id="st-animated-card"> <div class="st-animated-card__content"> <div class="st-animated-card__side st-animated-card__front" id="st-animated-card-side-front"> <div class="st-animated-card__logos"> <div class="st-animated-card__chip-logo"> <img src="" alt="" /> </div> <div class="st-animated-card__payment-logo" id="st-animated-card-payment-logo"></div> </div> <div class="st-animated-card__pan"> <label class="st-animated-card__label" id="st-animated-card-card-number-label"></label> <div class="st-animated-card__value" id="st-animated-card-number"></div> </div> <div class="st-animated-card__expiration-date-and-security-code"> <div class="st-animated-card__expiration-date"> <label class="st-animated-card__label" id="st-animated-card-expiration-date-label"></label> <div class="st-animated-card__value" id="st-animated-card-expiration-date"></div> </div> <div class="st-animated-card__security-code st-animated-card__security-code--front st-animated-card__security-code--front-hidden" id="st-animated-card-security-code-front" > <label class="st-animated-card__label" id="st-animated-card-security-code-label"></label> <div class="st-animated-card__value" id="st-animated-card-security-code-front-field"></div> </div> </div> </div> <div class="st-animated-card__side st-animated-card__back" id="st-animated-card-side-back"> <div class="st-animated-card__signature"></div> <div class="st-animated-card__security-code" id="st-animated-card-security-code"></div> </div> </div> </div>';
  document.body.innerHTML = html;
  const inputValues = {
    cardNumber: '123456789',
    expirationDate: '11/11',
    securityCode: '1234'
  };
  const themeObjects = [
    [{ type: AnimatedCard.CARD_TYPES.AMEX, logo: cardsLogos.amex }],
    [{ type: AnimatedCard.CARD_TYPES.ASTROPAYCARD, logo: cardsLogos.astropaycard }],
    [{ type: AnimatedCard.CARD_TYPES.DEFAULT, logo: '' }],
    [{ type: AnimatedCard.CARD_TYPES.DINERS, logo: cardsLogos.diners }],
    [{ type: AnimatedCard.CARD_TYPES.DISCOVER, logo: cardsLogos.discover }],
    [{ type: AnimatedCard.CARD_TYPES.JCB, logo: cardsLogos.jcb }],
    [{ type: AnimatedCard.CARD_TYPES.MAESTRO, logo: cardsLogos.maestro }],
    [{ type: AnimatedCard.CARD_TYPES.MASTERCARD, logo: cardsLogos.mastercard }],
    [{ type: AnimatedCard.CARD_TYPES.PIBA, logo: cardsLogos.piba }],
    [{ type: AnimatedCard.CARD_TYPES.VISA, logo: cardsLogos.visa }]
  ];

  const cardTypes = [
    [AnimatedCard.CARD_TYPES.ASTROPAYCARD],
    [AnimatedCard.CARD_TYPES.DEFAULT],
    [AnimatedCard.CARD_TYPES.DINERS],
    [AnimatedCard.CARD_TYPES.DISCOVER],
    [AnimatedCard.CARD_TYPES.JCB],
    [AnimatedCard.CARD_TYPES.MAESTRO],
    [AnimatedCard.CARD_TYPES.MASTERCARD],
    [AnimatedCard.CARD_TYPES.PIBA],
    [AnimatedCard.CARD_TYPES.VISA]
  ];
  const instance = new AnimatedCard();
  return {
    cardTypes,
    instance,
    inputValues,
    html,
    themeObjects
  };
}

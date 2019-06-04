import each from 'jest-each';
import Selectors from '../../../src/core/shared/Selectors';
import { cardsLogos } from '../../../src/components/animated-card/animated-card-logos';
import AnimatedCard from './../../../src/components/animated-card/AnimatedCard';
import { Translator } from '../../../src/core/shared/Translator';

// given
describe('AnimatedCard', () => {
  // given
  describe('ifCardExists()', () => {
    // when
    beforeAll(() => {
      const { html } = animatedCardFixture();
      document.body.innerHTML = html;
    });

    // then
    it('should return HTMLInput element', () => {
      expect(AnimatedCard.ifCardExists()).toBeTruthy();
    });
  });

  // given
  describe('setLabels()', () => {
    // when
    const { instance } = animatedCardFixture();
    // then
    it('should have set label text', () => {
      // @ts-ignore
      instance._setLabels();
      let card = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_LABEL);
      let expiry = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_LABEL);
      let secCode = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_LABEL);
      expect(card.innerHTML).toEqual('Card number');
      expect(expiry.innerHTML).toEqual('Expiration date');
      expect(secCode.innerHTML).toEqual('Security code');
      // @ts-ignore
      instance._translator = new Translator('fr_FR');
      // @ts-ignore
      instance._setLabels();
      expect(card.innerHTML).toEqual('Numéro de carte');
      expect(expiry.innerHTML).toEqual("Date d'expiration");
      expect(secCode.innerHTML).toEqual('Code de sécurité');
    });
  });

  // given
  describe('returnThemeClass()', () => {
    // when
    const { cardTypes, instance } = animatedCardFixture();
    // then
    each(cardTypes).it('should return proper name of class specified in parameter', (name: string) => {
      // @ts-ignore
      expect(instance._returnThemeClass(name)).toEqual(`st-animated-card__${name}`);
    });
  });

  // given
  describe('resetTheme()', () => {
    // when
    let { instance } = animatedCardFixture();
    // @ts-ignore
    const defaultFrontPageClassSet = `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`;
    // @ts-ignore
    const defaultBackPageClassSet = `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`;

    beforeEach(() => {
      // @ts-ignore
      instance._resetTheme();
    });
    // then
    it('should reset front page of card to default theme', () => {
      // @ts-ignore
      expect(instance._animatedCardFront.getAttribute('class')).toEqual(defaultFrontPageClassSet);
    });

    // then
    it('should reset back page of card to default theme', () => {
      // @ts-ignore
      expect(instance._animatedCardBack.getAttribute('class')).toEqual(defaultBackPageClassSet);
    });
  });

  // given
  describe('setThemeClasses()', () => {
    // when
    let { instance, themeObjects } = animatedCardFixture();

    // then
    each(themeObjects).it('should set proper classes for front page of card', themeObject => {
      // @ts-ignore
      instance._setThemeClasses();
      // @ts-ignore
      expect(instance._animatedCardFront.classList.contains(themeObject.type));
    });

    // then
    each(themeObjects).it('should set proper classes for back page of card', themeObject => {
      // @ts-ignore
      instance._setThemeClasses();
      // @ts-ignore
      expect(instance._animatedCardBack.classList.contains(themeObject.type));
    });
  });

  // given
  describe('_onCardNumberChanged()', () => {
    // when
    let { instance, inputValues } = animatedCardFixture();

    // then
    it('should set card number if it is requested to change', () => {
      // @ts-ignore
      instance._cardDetails.cardNumber = inputValues.cardNumber;
      // instance._onCardNumberChanged({type});
      // expect(instance.animatedCardPan.textContent).toEqual(inputValues.cardNumber);
    });
  });

  // given
  describe('onExpirationDateChanged()', () => {
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
      // @ts-ignore
      instance._onExpirationDateChanged(dataObject);
      // @ts-ignore
      expect(instance._cardDetails.expirationDate).toEqual(dataObject.value);
    });
  });

  // given
  describe('shouldFlipCard()', () => {
    // when
    let { instance, cardTypes } = animatedCardFixture();

    // then
    each(cardTypes).it('should flip card if it is requested', () => {
      // @ts-ignore
      const spy = jest.spyOn(instance, '_flipCard');
      // @ts-ignore
      instance._shouldFlipCard();
      expect(spy).toHaveBeenCalledTimes(1);
      // @ts-ignore
      instance._flipCardBack();
    });

    // then
    it('should not flip card if it is on no flipped list', () => {
      // @ts-ignore
      const spy = jest.spyOn(instance, '_flipCard');
      // @ts-ignore
      instance._cardDetails.type = 'AMEX';
      // @ts-ignore
      instance._shouldFlipCard();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // given
  describe('flipCard()', () => {
    // when
    let { instance } = animatedCardFixture();

    // then
    // @ts-ignore
    it(`should add ${AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION} class to element`, () => {
      // @ts-ignore
      instance._flipCard();
      // @ts-ignore
      expect(instance._cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION));
    });
  });

  // given
  describe('flipCardBack()', () => {
    // when
    let { instance, cardTypes } = animatedCardFixture();

    // then
    each(cardTypes).it(`should flip back card`, (type: string) => {
      // @ts-ignore
      instance._cardDetails.type = type;
      // @ts-ignore
      instance._flipCardBack();
      // @ts-ignore
      expect(instance._cardElement.getAttribute('class')).toEqual(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    });
  });

  // given
  describe('_setLabels()', () => {
    let { instance } = animatedCardFixture();
    // then
    // @ts-ignore
    it(`should set card number on start with value: ${AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER}`, () => {
      // @ts-ignore
      instance._setLabels();
      // @ts-ignore
      expect(instance._animatedCardPan.textContent).toEqual(AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER);
    });

    // then
    it(`should set expiration date on start with value: ${
      // @ts-ignore
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    }`, () => {
      // @ts-ignore
      instance._setLabels();
      // @ts-ignore
      expect(instance._animatedCardExpirationDate.textContent).toEqual(
        // @ts-ignore
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
      );
    });

    // then
    // @ts-ignore
    it(`should set security code on start with value: ${AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE}`, () => {
      // @ts-ignore
      instance._setDefaultInputsValues();
      // @ts-ignore
      expect(instance._animatedCardSecurityCode.textContent).toEqual(
        // @ts-ignore
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
      );
    });
  });

  // given
  describe('setSubscribeEvents()', () => {
    // when
    const functionCalls = 1;
    let instance: any;
    beforeEach(() => {
      instance = animatedCardFixture().instance;
    });
    // then
    it(`should onCardNumberChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, '_onCardNumberChanged');
      instance._animatedCardPan.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });

    // then
    it(`should onExpirationDateChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, '_onExpirationDateChanged');
      instance._animatedCardExpirationDate.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });

    // then
    it(`should onSecurityCodeChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, '_onSecurityCodeChanged');
      instance._animatedCardSecurityCode.onfocus = () => {
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
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.AMEX, logo: cardsLogos.amex }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.ASTROPAYCARD, logo: cardsLogos.astropaycard }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.DEFAULT, logo: '' }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.DINERS, logo: cardsLogos.diners }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.DISCOVER, logo: cardsLogos.discover }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.JCB, logo: cardsLogos.jcb }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.MAESTRO, logo: cardsLogos.maestro }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.MASTERCARD, logo: cardsLogos.mastercard }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.PIBA, logo: cardsLogos.piba }],
    // @ts-ignore
    [{ type: AnimatedCard.CARD_TYPES.VISA, logo: cardsLogos.visa }]
  ];

  const cardTypes = [
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.ASTROPAYCARD],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.DEFAULT],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.DINERS],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.DISCOVER],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.JCB],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.MAESTRO],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.MASTERCARD],
    // @ts-ignore
    [AnimatedCard.CARD_TYPES.PIBA],
    // @ts-ignore
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

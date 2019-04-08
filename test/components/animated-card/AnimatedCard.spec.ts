import each from 'jest-each';
import MessageBus from '../../../src/core/shared/MessageBus';
import Selectors from '../../../src/core/shared/Selectors';
import { cardsLogos } from '../../../src/components/animated-card/animated-card-logos';
import AnimatedCard from './../../../src/components/animated-card/AnimatedCard';
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
  describe('Method returnThemeClass', () => {
    const { cardTypes } = animatedCardFixture();
    // then
    each(cardTypes).it('should return proper name of class specified in parameter', (name: string) => {
      expect(AnimatedCard.returnThemeClass(name)).toEqual(`st-animated-card__${name}`);
    });
  });

  // given
  describe('Method resetToDefaultTheme', () => {
    // given
    let { instance } = animatedCardFixture();
    const defaultFrontPageClassSet = `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`;
    const defaultBackPageClassSet = `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`;

    beforeEach(() => {
      instance.resetToDefaultTheme();
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
  describe('Method setThemeProperties', () => {
    // when
    let { instance, themeObjects } = animatedCardFixture();

    // then
    each(themeObjects).it('should set proper classes for front page of card', themeObject => {
      instance.setThemeProperties(themeObject);
      expect(instance.animatedCardFront.classList.contains(themeObject.type));
    });

    // then
    each(themeObjects).it('should set proper classes for back page of card', themeObject => {
      instance.setThemeProperties(themeObject);
      expect(instance.animatedCardBack.classList.contains(themeObject.type));
    });

    // then
    each(themeObjects).it('should set proper logo of specified card', themeObject => {
      instance.setThemeProperties(themeObject);
      const img = document.getElementById(AnimatedCard.PAYMENT_LOGO_ID);
      expect(img.getAttribute('src')).toEqual(String(themeObject.logo));
    });
  });

  describe('Method setThemeObject', () => {
    const { themeObjects } = animatedCardFixture();
    // then
    each(themeObjects).it('should set themeObject based on parameters passed', (type: string, logo: string) => {
      const themeObject = { type, logo };
      expect(AnimatedCard.setThemeObject(type, logo)).toEqual(themeObject);
    });
  });

  // given
  describe('Method setCardTheme', () => {
    let { instance, cardTypes } = animatedCardFixture();
    // then
    it('should resetToDefaultTheme been called once', () => {
      const spy = jest.spyOn(instance, 'resetToDefaultTheme');
      instance.setCardTheme();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    // then
    each(cardTypes).it('should set proper type of theme', (type: string) => {
      instance.cardDetails.type = type;
      expect(instance.setCardTheme().type).toEqual(AnimatedCard.returnThemeClass(type.toLowerCase()));
    });

    // then
    it('should setThemeProperties been called once', () => {
      const spy = jest.spyOn(instance, 'setThemeProperties');
      instance.setCardTheme();
      expect(spy).toHaveBeenCalledTimes(1);
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
    let dataObject = { value: '', validity: false };
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
      instance.shouldFlipCard(type);
      expect(spy).toHaveBeenCalledTimes(1);
      instance.flipCardBack(type);
    });
    it('should not flip card if it is on no flipped list', () => {
      const spy = jest.spyOn(instance, 'flipCard');
      instance.shouldFlipCard('AMEX');
      expect(spy).toHaveBeenCalledTimes(0);
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
      instance.flipCardBack(type);
      expect(instance.cardElement.getAttribute('class')).toEqual(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
    });
  });

  // given
  describe('Method subscribeInputEvent', () => {
    let { instance } = animatedCardFixture();

    // then
    each([
      [MessageBus.EVENTS.CARD_NUMBER_CHANGE, AnimatedCard.COMPONENTS_IDS.CARD_NUMBER],
      [MessageBus.EVENTS.EXPIRATION_DATE_CHANGE, AnimatedCard.COMPONENTS_IDS.EXPIRATION_DATE],
      [MessageBus.EVENTS.SECURITY_CODE_CHANGE, AnimatedCard.COMPONENTS_IDS.SECURITY_CODE]
    ]).it('should setCardTheme been called once', (event: string, component: string) => {
      const spySetCardTheme = jest.spyOn(instance, 'setCardTheme');
      //const spysetValueOnCard = jest.spyOn(instance, 'setValueOnCard');
      // instance.subscribeInputEvent(event, component);
      // TODO: to be fixed
      // expect(spysetValueOnCard).toHaveBeenCalledTimes(1);
    });

    // then
    it('should set card number type if Card Number component event has been triggered', () => {
      const element = document.getElementById(AnimatedCard.PAYMENT_LOGO_ID);
      instance.cardDetails.type = 'AMEX';
      // instance.subscribeInputEvent(MessageBus.EVENTS.CARD_NUMBER_CHANGE, AnimatedCard.COMPONENTS_IDS.CARD_NUMBER);
      // TODO: this.messageBus.subscribe has to be mocked somehow
      // expect(element.getAttribute('alt')).toEqual(instance.cardDetails.type);
    });
  });

  // given
  describe('Method _setDefaultImagesAttributes', () => {
    let { instance } = animatedCardFixture();
    let chipImage: HTMLElement;
    let cardTypeImage: HTMLElement;

    beforeEach(() => {
      chipImage = document.getElementById(AnimatedCard.CHIP_LOGO_ID);
      cardTypeImage = document.getElementById(AnimatedCard.PAYMENT_LOGO_ID);
    });

    // then
    it('should set default image to chip card image', () => {
      instance.setDefaultImagesAttributes();
      expect(chipImage.getAttribute('src')).toEqual(cardsLogos.chip);
    });

    // then
    it('should set default image to card type image', () => {
      instance.setDefaultImagesAttributes();
      expect(cardTypeImage.getAttribute('src')).toEqual(cardsLogos.visa);
    });

    // then
    it('should set default alt attribute to card type image', () => {
      instance.setDefaultImagesAttributes();
      expect(cardTypeImage.getAttribute('alt')).toEqual(AnimatedCard.CARD_DETAILS_PLACEHOLDERS.TYPE);
    });
  });

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
  describe('Method _setSubscribeEvents', () => {
    let { instance } = animatedCardFixture();
    const functionCalls = 3;
    // then
    it(`should _setSubscribeEvents been called ${functionCalls} times`, () => {
      // const spy = jest.spyOn(instance, 'subscribeInputEvent');
      // instance.setSubscribeEvents();
      // expect(spy).toHaveBeenCalledTimes(functionCalls);
    });
  });
});

function animatedCardFixture() {
  const html =
    '<div class="st-animated-card" id="st-animated-card"> <div class="st-animated-card__content"> <div class="st-animated-card__side st-animated-card__front" id="st-animated-card-side-front"> <div class="st-animated-card__logos"> <div class="st-animated-card__chip-logo"> <img src="" alt="Chip logo" id="st-chip-logo" /> </div> <div class="st-animated-card__payment-logo"> <img src="" alt="Payment logo" id="st-payment-logo" class="st-animated-card__payment-logo-img" /> </div> </div> <div class="st-animated-card__security-code st-animated-card__security-code--front" id="st-animated-card-security-code-front" ></div> <div class="st-animated-card__pan"> <label class="st-animated-card__label">Card number</label> <div class="st-animated-card__value" id="st-animated-card-number"></div> </div> <div class="st-animated-card__expiration-date"> <label class="st-animated-card__label">Expiration date</label> <div class="st-animated-card__value" id="st-animated-card-expiration-date"></div> </div> </div> <div class="st-animated-card__side st-animated-card__back" id="st-animated-card-side-back"> <div class="st-animated-card__signature"></div> <div class="st-animated-card__security-code" id="st-animated-card-security-code"></div> </div> </div> </div>';
  document.body.innerHTML = html;
  const inputValues = {
    cardNumber: '123456789',
    expirationDate: '11/11',
    securityCode: '1234'
  };
  const themeObjects = [
    [{ type: AnimatedCard.CARD_BRANDS.AMEX, logo: cardsLogos.amex }],
    [{ type: AnimatedCard.CARD_BRANDS.ASTROPAYCARD, logo: cardsLogos.astropaycard }],
    [{ type: AnimatedCard.CARD_BRANDS.DINERS, logo: cardsLogos.diners }],
    [{ type: AnimatedCard.CARD_BRANDS.DISCOVER, logo: cardsLogos.discover }],
    [{ type: AnimatedCard.CARD_BRANDS.JCB, logo: cardsLogos.jcb }],
    [{ type: AnimatedCard.CARD_BRANDS.MAESTRO, logo: cardsLogos.maestro }],
    [{ type: AnimatedCard.CARD_BRANDS.MASTERCARD, logo: cardsLogos.mastercard }],
    [{ type: AnimatedCard.CARD_BRANDS.PIBA, logo: cardsLogos.piba }],
    [{ type: AnimatedCard.CARD_BRANDS.VISA, logo: cardsLogos.VISA }]
  ];

  const cardTypes = [
    [AnimatedCard.CARD_BRANDS.ASTROPAYCARD],
    [AnimatedCard.CARD_BRANDS.DINERS],
    [AnimatedCard.CARD_BRANDS.DISCOVER],
    [AnimatedCard.CARD_BRANDS.JCB],
    [AnimatedCard.CARD_BRANDS.MAESTRO],
    [AnimatedCard.CARD_BRANDS.MASTERCARD],
    [AnimatedCard.CARD_BRANDS.PIBA],
    [AnimatedCard.CARD_BRANDS.VISA]
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

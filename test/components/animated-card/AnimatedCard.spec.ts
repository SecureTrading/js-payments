import each from 'jest-each';
import { cardsLogos } from '../../../src/components/animated-card/animated-card-logos';
import { StCodec } from '../../../src/core/classes/StCodec.class';
import AnimatedCard from './../../../src/components/animated-card/AnimatedCard';
import Selectors from '../../../src/core/shared/Selectors';
import { Translator } from '../../../src/core/shared/Translator';
import MessageBus from '../../../src/core/shared/MessageBus';

jest.mock('./../../../src/core/shared/MessageBus');

// given
describe('AnimatedCard', () => {
  // given
  describe('constructor()', () => {
    let instance: AnimatedCard;
    let originalBinLookup: any;
    let spy: any;
    beforeEach(() => {
      // @ts-ignore
      originalBinLookup = AnimatedCard.prototype.getBinLookupConfig;
      jest.spyOn(AnimatedCard.prototype, 'onInit');
      // @ts-ignore
      jest.spyOn(AnimatedCard.prototype, '_setLabels');
      // @ts-ignore
      jest.spyOn(AnimatedCard.prototype, '_setDefaultInputsValues');
      // @ts-ignore
      jest.spyOn(AnimatedCard.prototype, '_setSubscribeEvents');
      // @ts-ignore
    });

    // then
    it('should call necessary functions', () => {
      // @ts-ignore
      spy = AnimatedCard.prototype.getBinLookupConfig = jest.fn().mockReturnValueOnce({});
      instance = new AnimatedCard();
      // @ts-ignore
      expect(instance.onInit).toBeCalledTimes(1);
      expect(instance.onInit).toBeCalledWith();
      // @ts-ignore
      expect(instance._setLabels).toBeCalledTimes(1);
      // @ts-ignore
      expect(instance._setLabels).toBeCalledWith();
      // @ts-ignore
      expect(instance._setDefaultInputsValues).toBeCalledTimes(1);
      // @ts-ignore
      expect(instance._setDefaultInputsValues).toBeCalledWith();
      // @ts-ignore
      expect(instance._setSubscribeEvents).toBeCalledTimes(1);
      // @ts-ignore
      expect(instance._setSubscribeEvents).toBeCalledWith();
      // @ts-ignore
      expect(instance._cardDetails).toMatchObject({
        cardNumber:
          '\u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219',
        expirationDate: 'MM/YY',
        logo: undefined,
        securityCode: '\u2219\u2219\u2219',
        type: null
      });
    });

    // then
    it('should default card type', () => {
      // @ts-ignore
      spy = AnimatedCard.prototype.getBinLookupConfig = jest.fn().mockReturnValueOnce({ defaultCardType: 'VISA' });
      instance = new AnimatedCard();
      // @ts-ignore
      expect(instance._cardDetails).toMatchObject({
        cardNumber:
          '\u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219 \u2219\u2219\u2219\u2219',
        expirationDate: 'MM/YY',
        logo: cardsLogos.visa,
        securityCode: '\u2219\u2219\u2219',
        type: 'visa'
      });
    });

    afterEach(() => {
      // @ts-ignore
      AnimatedCard.prototype.getBinLookupConfig = originalBinLookup;
    });
  });

  // given
  describe('ifCardExists()', () => {
    // then
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
  describe('setCardDetail()', () => {
    // then
    it('should return placeholder when value is not defined', () => {
      // @ts-ignore
      expect(AnimatedCard._setCardDetail('', 'some placeholder')).toEqual('some placeholder');
    });

    // then
    it('should return value when value is defined', () => {
      // @ts-ignore
      expect(AnimatedCard._setCardDetail('some value', 'some placeholder')).toEqual('some value');
    });
  });

  // given
  describe('getLogo', () => {
    // then
    each(['amex', 'astropaycard', 'diners', 'discover', 'jcb', 'maestro', 'mastercard', 'piba', 'visa']).it(
      'should return logo content',
      (logoName: string) => {
        // @ts-ignore
        expect(AnimatedCard._getLogo(logoName)).toEqual(cardsLogos[logoName]);
      }
    );
  });

  // given
  describe('setSecurityCodeChangeListener', () => {
    const { instance } = animatedCardFixture();
    // then
    it('should be triggered', () => {});
  });

  // given
  describe('setSecurityCodeFocusEventListener', () => {
    // then
    it('should be triggered', () => {});
  });

  // given
  describe('_setSecurityCodePlaceholderContent', () => {
    const securityCodeLength = 3;
    const securityCodeLengthExtended = 4;
    const { instance } = animatedCardFixture();

    // then
    it('should return regular placeholder', () => {
      // @ts-ignore
      instance._setSecurityCodePlaceholderContent(securityCodeLength);
      // @ts-ignore
      expect(instance._animatedCardSecurityCodeFrontField.textContent).toEqual(
        // @ts-ignore
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
      );
    });

    // then
    it('should return extended placeholder', () => {
      // @ts-ignore
      instance._setSecurityCodePlaceholderContent(securityCodeLengthExtended);
      // @ts-ignore
      expect(instance._animatedCardSecurityCodeFrontField.textContent).toEqual(
        // @ts-ignore
        AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE_EXTENDED
      );
    });
  });

  // given
  describe('_setSecurityCodeChangeListener()', () => {
    let instance: AnimatedCard;
    instance = new AnimatedCard();
    const event = { type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, data: 'SOME EVENT DATA' };
    // @ts-ignore
    const spy = jest.spyOn(instance, '_setSecurityCodePlaceholderContent');

    // when
    beforeEach(() => {
      instance = animatedCardFixture().instance;
      // @ts-ignore
      instance._setSecurityCodeChangeListener();
      // @ts-ignore
      instance._messageBus.publish = jest.fn();
    });

    // then
    it.skip('should trigger _setSecurityCodePlaceholderContent()', () => {
      // @ts-ignore
      expect(instance._messageBus.publish).toHaveBeenCalledWith(
        {
          data: false,
          type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH
        },
        true
      );
    });
  });

  // given
  describe('_setSecurityCodeFocusEventListener()', () => {
    let instance: AnimatedCard;
    instance = new AnimatedCard();
    const eventPositive = { type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, data: true };
    const eventNegative = { type: MessageBus.EVENTS.CHANGE_SECURITY_CODE_LENGTH, data: false };
    // @ts-ignore
    const spyFlip = jest.spyOn(instance, '_shouldFlipCard');
    // @ts-ignore
    const spyFlipBack = jest.spyOn(instance, '_flipCardBack');

    // when
    beforeEach(() => {
      instance = animatedCardFixture().instance;
      // @ts-ignore
      instance._setSecurityCodeChangeListener();
    });

    // then
    it.skip('should flip card when state is true', () => {
      // @ts-ignore
      instance._messageBus.publish(eventPositive);
      expect(spyFlip).toHaveBeenCalled();
    });

    // then
    it.skip('should flip card back when state is false', () => {
      // @ts-ignore
      instance._messageBus.publish(eventNegative);
      expect(spyFlipBack).toHaveBeenCalled();
    });
  });

  // given
  describe('setLabels()', () => {
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

    // then
    it('should set proper type class', () => {
      // @ts-ignore
      instance._cardDetails.type = 'visa';
      // @ts-ignore
      instance._animatedCardLogoBackground.setAttribute('class', '');
      // @ts-ignore
      instance._setThemeClasses();

      // @ts-ignore
      expect(instance._animatedCardLogoBackground.classList[0]).toBe('st-animated-card__payment-logo');
      // @ts-ignore
      expect(instance._animatedCardLogoBackground.classList.length).toBe(1);
    });
    // then
    it('should set proper default class', () => {
      // @ts-ignore
      instance._cardDetails.type = undefined;
      // @ts-ignore
      instance._animatedCardLogoBackground.setAttribute('class', '');
      // @ts-ignore
      instance._setThemeClasses();
      // @ts-ignore
      expect(instance._animatedCardLogoBackground.classList[0]).toBe('st-animated-card__payment-logo');
      // @ts-ignore
      expect(instance._animatedCardLogoBackground.classList[1]).toBe('st-animated-card__payment-logo--default');
      // @ts-ignore
      expect(instance._animatedCardLogoBackground.classList.length).toBe(2);
    });
    it('should add standard standard theme if type is not defined', () => {
      // @ts-ignore
      instance._cardDetails.typ = undefined;
      // @ts-ignore
      instance._setThemeClasses();
      // @ts-ignore
      expect(instance._animatedCardLogoBackground.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_LOGO)).toEqual(
        true
      );
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
  describe('_setSubscribeEvents()', () => {
    // when
    const functionCalls = 1;
    let instance: any;
    beforeEach(() => {
      instance = animatedCardFixture().instance;
    });
    // then
    it(`should _onCardNumberChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, '_onCardNumberChanged');
      instance._animatedCardPan.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });

    // then
    it(`should _onExpirationDateChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, '_onExpirationDateChanged');
      instance._animatedCardExpirationDate.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });

    // then
    it(`should _onSecurityCodeChanged been called ${functionCalls} times when it's changed`, () => {
      const spy = jest.spyOn(instance, '_onSecurityCodeChanged');
      instance._animatedCardSecurityCode.onfocus = () => {
        expect(spy).toHaveBeenCalledTimes(functionCalls);
      };
    });
  });

  // given
  describe('getBinLookupConfig()', () => {
    // when
    let { instance } = animatedCardFixture();

    // then
    it('should return empty config', () => {
      // @ts-ignore
      instance._params = {};
      // @ts-ignore
      expect(instance.getBinLookupConfig()).toStrictEqual({});
    });

    // then
    it('should get supported', () => {
      // @ts-ignore
      instance._params = { paymentTypes: 'VISA,MASTERCARD' };
      // @ts-ignore
      expect(instance.getBinLookupConfig()).toStrictEqual({ supported: ['VISA', 'MASTERCARD'] });
    });

    // then
    it('should get defaultCardType', () => {
      // @ts-ignore
      instance._params = { defaultPaymentType: 'AMEX' };
      // @ts-ignore
      expect(instance.getBinLookupConfig()).toStrictEqual({ defaultCardType: 'AMEX' });
    });

    // then
    it('should get all configs', () => {
      // @ts-ignore
      instance._params = { defaultPaymentType: 'AMEX', paymentTypes: 'VISA,MASTERCARD,AMEX' };
      // @ts-ignore
      expect(instance.getBinLookupConfig()).toStrictEqual({
        defaultCardType: 'AMEX',
        supported: ['VISA', 'MASTERCARD', 'AMEX']
      });
    });
  });
  describe('setCardType', () => {
    let instance: any;
    beforeEach(() => {
      instance = animatedCardFixture().instance;
    });
    it('should set card type', () => {
      expect(instance._setCardType('400000')).toEqual('visa');
    });
  });

  // given
  describe('AnimatedCard.getLogo', () => {
    const { cardTypes } = animatedCardFixture();
    each(cardTypes).it('should set card type', type => {
      // @ts-ignore
      expect(AnimatedCard._getLogo(type[0])).toEqual(cardsLogos[type[0]]);
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

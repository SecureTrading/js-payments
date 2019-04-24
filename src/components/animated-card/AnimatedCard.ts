import BinLookup from '../../core/shared/BinLookup';
import DOMMethods from '../../core/shared/DomMethods';
import MessageBus from '../../core/shared/MessageBus';
import Selectors from '../../core/shared/Selectors';
import { cardsLogos } from './animated-card-logos';

/**
 * Defines animated card, it's 'stateless' component which only receives data validated previously by other components.
 */
class AnimatedCard {
  public static CARD_TYPES = {
    AMEX: 'amex',
    ASTROPAYCARD: 'astropaycard',
    DEFAULT: 'default',
    DINERS: 'diners',
    DISCOVER: 'discover',
    JCB: 'jcb',
    MAESTRO: 'maestro',
    MASTERCARD: 'mastercard',
    PIBA: 'piba',
    VISA: 'visa'
  };

  public static CARD_COMPONENT_CLASS = 'st-animated-card';
  public static CARD_CLASSES = {
    CLASS_BACK: `${AnimatedCard.CARD_COMPONENT_CLASS}__back`,
    CLASS_FOR_ANIMATION: `${AnimatedCard.CARD_COMPONENT_CLASS}__flip-card`,
    CLASS_FRONT: `${AnimatedCard.CARD_COMPONENT_CLASS}__front`,
    CLASS_SIDE: `${AnimatedCard.CARD_COMPONENT_CLASS}__side`,
    CLASS_LOGO_WRAPPER: `${AnimatedCard.CARD_COMPONENT_CLASS}-payment-logo`,
    CLASS_LOGO: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo`,
    CLASS_LOGO_DEFAULT: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo--default`,
    CLASS_SECURITY_CODE_HIDDEN: `${AnimatedCard.CARD_COMPONENT_CLASS}__security-code--front-hidden`,
    CLASS_LOGO_IMAGE: `${AnimatedCard.CARD_COMPONENT_CLASS}__payment-logo-img`
  };
  public static CARD_DETAILS_PLACEHOLDERS = {
    CARD_NUMBER: 'XXXX XXXX XXXX XXXX',
    EXPIRATION_DATE: 'MM/YY',
    SECURITY_CODE: 'XXX',
    TYPE: 'default'
  };

  public static NOT_FLIPPED_CARDS = [AnimatedCard.CARD_TYPES.AMEX];

  // @ts-ignore
  public static ifCardExists = (): HTMLInputElement => document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);

  /**
   * Returns theme class for specified theme
   * @param theme
   */
  public returnThemeClass = (theme: string) => `${AnimatedCard.CARD_COMPONENT_CLASS}__${theme}`;

  public animatedCardBack: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_BACK);
  public animatedCardExpirationDate: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_EXPIRATION_DATE_ID);
  public animatedCardFront: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SIDE_FRONT);
  public animatedCardPan: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_CREDIT_CARD_ID);
  public animatedCardSecurityCode: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_SECURITY_CODE_ID);
  public animatedCardSecurityCodeFront: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_ID
  );
  public animatedCardSecurityCodeFrontField: HTMLElement = document.getElementById(
    Selectors.ANIMATED_CARD_SECURITY_CODE_FRONT_FIELD_ID
  );

  public animatedCardLogoBackground: HTMLElement = document.getElementById(
    AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER
  );
  public binLookup: BinLookup;
  public cardDetails: any = {
    cardNumber: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER,
    expirationDate: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE,
    securityCode: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE,
    type: AnimatedCard.CARD_DETAILS_PLACEHOLDERS.TYPE,
    logo: ''
  };
  public cardElement: HTMLElement = document.getElementById(Selectors.ANIMATED_CARD_INPUT_SELECTOR);
  public messageBus: MessageBus;

  constructor() {
    this.binLookup = new BinLookup();
    this.messageBus = new MessageBus();
    this.setDefaultInputsValues();
    this.setSubscribeEvents();
  }

  /**
   * Resets styles on both sides of credit card to default theme
   */
  public resetTheme() {
    this.animatedCardSecurityCodeFrontField.textContent = '';
    this.animatedCardFront.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_FRONT}`
    );
    this.animatedCardBack.setAttribute(
      'class',
      `${AnimatedCard.CARD_CLASSES.CLASS_SIDE} ${AnimatedCard.CARD_CLASSES.CLASS_BACK}`
    );
  }

  /**
   * Sets theme properties: css settings and card type
   */
  public setThemeClasses() {
    const { type } = this.cardDetails;

    if (type === AnimatedCard.CARD_TYPES.DEFAULT || type == undefined) {
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    } else {
      DOMMethods.addClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO}`);
      DOMMethods.removeClass(this.animatedCardLogoBackground, `${AnimatedCard.CARD_CLASSES.CLASS_LOGO_DEFAULT}`);
    }
    DOMMethods.addClass(this.animatedCardFront, this.returnThemeClass(type));
    DOMMethods.addClass(this.animatedCardBack, this.returnThemeClass(type));
  }

  /**
   * Sets card logo based on cardDetails
   */
  public setLogo() {
    const { logo, type } = this.cardDetails;
    if (!document.getElementById(Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID) && logo) {
      const element = DOMMethods.createHtmlElement.apply(this, [
        {
          alt: type,
          src: logo,
          class: AnimatedCard.CARD_CLASSES.CLASS_LOGO_IMAGE,
          id: Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID
        },
        'img'
      ]);
      DOMMethods.appendChildIntoDOM(AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER, element);
      DOMMethods.setProperty.apply(this, ['src', logo, Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID]);
    } else if (logo) {
      DOMMethods.setProperty.apply(this, ['src', logo, Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID]);
    }
    return logo;
  }

  /**
   * Getting logo from external js file
   * @param type
   */
  public static getLogo = (type: string) => cardsLogos[type];

  /**
   * Sets card theme according to card brand coming from binLookup()
   */
  public setTheme() {
    if (this.cardDetails.type === AnimatedCard.CARD_TYPES.AMEX) {
      this.animatedCardSecurityCodeFrontField.textContent = AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE;
    }
    this.cardDetails.logo = AnimatedCard.getLogo(this.cardDetails.type);
  }

  /**
   * For particular type of card it sets security code on front side of card
   */
  public setSecurityCodeOnProperSide = () => {
    if (this.cardDetails.type === AnimatedCard.CARD_TYPES.AMEX) {
      DOMMethods.removeClass(this.animatedCardSecurityCodeFront, AnimatedCard.CARD_CLASSES.CLASS_SECURITY_CODE_HIDDEN);
    } else {
      DOMMethods.addClass(this.animatedCardSecurityCodeFront, AnimatedCard.CARD_CLASSES.CLASS_SECURITY_CODE_HIDDEN);
    }

    return this.cardDetails.type === AnimatedCard.CARD_TYPES.AMEX
      ? this.animatedCardSecurityCodeFrontField
      : this.animatedCardSecurityCode;
  };

  /**
   * Checks if given card should not be flipped
   */
  public shouldFlipCard() {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(this.cardDetails.type)) {
      if (!this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.flipCard();
      }
    }
  }

  /**
   * Flips card to see details on revers
   */
  public flipCard = () => this.cardElement.classList.add(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION);

  /**
   * Flips back card by clearing classes
   */
  public flipCardBack() {
    if (!AnimatedCard.NOT_FLIPPED_CARDS.includes(this.cardDetails.type)) {
      if (this.cardElement.classList.contains(AnimatedCard.CARD_CLASSES.CLASS_FOR_ANIMATION)) {
        this.cardElement.setAttribute('class', Selectors.ANIMATED_CARD_INPUT_SELECTOR);
      }
    }
  }

  /**
   * Removes cards logo when it's theme changed  to default
   */
  public removeLogo = () =>
    DOMMethods.removeChildFromDOM.apply(this, [
      AnimatedCard.CARD_CLASSES.CLASS_LOGO_WRAPPER,
      Selectors.ANIMATED_CARD_PAYMENT_LOGO_ID
    ]);

  /**
   * Sets placeholders for each editable value on card (card number, expiration date, security code)
   */
  public setDefaultInputsValues() {
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Set one of three values on animated card
   * @param data
   * @param placeholder
   */
  public static setCardDetail(data: any, placeholder: string) {
    let { value } = data;
    return value ? value : placeholder;
  }

  /**
   * Sets card type based on binLookup request
   * @param cardNumber
   */
  public setCardType(cardNumber: string) {
    const type = this.binLookup.binLookup(cardNumber).type;
    return type ? type.toLowerCase() : type;
  }

  /**
   * Listens to changes coming from Card Number field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onCardNumberChanged(data: any) {
    const { value } = data;
    this.cardDetails.type = this.setCardType(value);
    this.cardDetails.cardNumber = AnimatedCard.setCardDetail(data, AnimatedCard.CARD_DETAILS_PLACEHOLDERS.CARD_NUMBER);
    this.animatedCardPan.textContent = this.cardDetails.cardNumber;
    this.flipCardBack();
    this.resetTheme();
    this.setTheme();
    this.removeLogo();
    this.setLogo();
    this.setThemeClasses();
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Listens to changes coming from Expiration Date field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onExpirationDateChanged(data: any) {
    this.cardDetails.expirationDate = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.EXPIRATION_DATE
    );
    this.flipCardBack();
    this.animatedCardExpirationDate.textContent = this.cardDetails.expirationDate;
  }

  /**
   * Listens to changes coming from Security Code field and sets proper class properties.
   * Receives object: { type, name, value}
   * Where:
   * type: Type of credit card (eg. AMEX, VISA etc.)
   * value: Value passed from component
   */
  public onSecurityCodeChanged(data: any) {
    this.cardDetails.securityCode = AnimatedCard.setCardDetail(
      data,
      AnimatedCard.CARD_DETAILS_PLACEHOLDERS.SECURITY_CODE
    );
    this.shouldFlipCard();
    this.setSecurityCodeOnProperSide().textContent = this.cardDetails.securityCode;
  }

  /**
   * Sets subscribe events on every editable field of card
   */
  public setSubscribeEvents() {
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_CARD_NUMBER, (data: any) => this.onCardNumberChanged(data));
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, (data: any) =>
      this.onExpirationDateChanged(data)
    );
    this.messageBus.subscribe(MessageBus.EVENTS.CHANGE_SECURITY_CODE, (data: any) => this.onSecurityCodeChanged(data));
  }
}

export default AnimatedCard;

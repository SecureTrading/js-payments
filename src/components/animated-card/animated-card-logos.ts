import { amex, astropaycard, diners, discover, jcb, maestro, mastercard, piba, visa } from '../../core/imports/images';

const cardsLogos: { [brandName: string]: string } = {
  amex,
  astropaycard,
  default: '',
  diners,
  discover,
  jcb,
  maestro,
  mastercard,
  piba,
  visa
};

export { cardsLogos };

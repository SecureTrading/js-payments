const filesToCache = {
  amex: '../../../images/amex.png',
  applePay: '../../../images/apple-pay.png',
  astropaycard: '../../../images/astropaycard.png',
  default: '../../../images/chip.png',
  diners: '../../../images/diners.png',
  discover: '../../../images/discover.png',
  jcb: '../../../images/jcb.png',
  maestro: '../../../images/maestro.png',
  mastercard: '../../../images/mastercard.png',
  piba: '../../../images/piba.png',
  visa: '../../../images/visa.png'
};

const cardsLogos: { [brandName: string]: string } = {
  amex: filesToCache.amex,
  astropaycard: filesToCache.astropaycard,
  default: filesToCache.default,
  diners: filesToCache.diners,
  discover: filesToCache.discover,
  jcb: filesToCache.jcb,
  maestro: filesToCache.maestro,
  mastercard: filesToCache.mastercard,
  piba: filesToCache.piba,
  visa: filesToCache.visa
};

export { cardsLogos };

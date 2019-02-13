const expiryDate = '(1[0-2]|0[1-9])/dd';
const expiryDateRegexp = new RegExp(expiryDate);

const creditCardBlocks: { [key: string]: RegExp } = {
  amex: /(\\d{1,4})(\\d{1,6})?(\\d+)?/,
  astropaycard: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  diners: /(\\d{1,4})(\\d{1,6})?(\\d+)?/,
  discover: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  jcb: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  laser: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  maestro: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  mastercard: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  piba: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  visa: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
  general: /(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?/,
};

const creditCardSecurityCodeLength = {
  amex: 4,
  astropaycard: 4,
  diners: 3,
  discover: 3,
  jcb: 3,
  laser: 3,
  maestro: 3,
  mastercard: 3,
  piba: 0,
  visa: 3,
};

const creditCardRegexes: { [key: string]: RegExp } = {
  amex: /^3[47]\d{0,13}/,
  astropaycard: /^/,
  diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,
  discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,
  jcb: /^(?:35\d{0,2})\d{0,12}/,
  laser: /^(6304|6706|6709|6771)[0-9]{12,15}/,
  maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,
  mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
  piba: /^/,
  visa: /^4\d{0,15}/,
};

export {
  creditCardBlocks,
  creditCardRegexes,
  expiryDateRegexp,
  expiryDate,
  creditCardSecurityCodeLength,
};

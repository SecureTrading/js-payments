const expiryDate = '(1[0-2]|0[1-9])/dd';
const cardNumber = '\\d{4} \\d{4} \\d{4} \\d{4}';

const cardNumberRegexp = new RegExp(cardNumber);
const expiryDateRegexp = new RegExp(expiryDate);

const creditCardBlocks: { [key: string]: string[] } = {
  uatp: [4, 5, 6],
  amex: [4, 6, 5],
  diners: [4, 6, 4],
  discover: [4, 4, 4, 4],
  mastercard: [4, 4, 4, 4],
  dankort: [4, 4, 4, 4],
  instapayment: [4, 4, 4, 4],
  jcb15: [4, 6, 5],
  jcb: [4, 4, 4, 4],
  maestro: [4, 4, 4, 4],
  visa: [4, 4, 4, 4],
  mir: [4, 4, 4, 4],
  unionPay: [4, 4, 4, 4],
  general: [4, 4, 4, 4],
};

const creditCardRegexes: { [key: string]: RegExp } = {
  amex: /^3[47]\d{0,13}/,
  dankort: /^(5019|4175|4571)\d{0,12}/,
  diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,
  discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,
  instapayment: /^63[7-9]\d{0,13}/,
  jcb: /^(?:35\d{0,2})\d{0,12}/,
  jcb15: /^(?:2131|1800)\d{0,11}/,
  mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
  maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,
  mir: /^220[0-4]\d{0,12}/,
  uatp: /^(?!1800)1\d{0,14}/,
  unionPay: /^62\d{0,14}/,
  visa: /^4\d{0,15}/,
};

export {
  cardNumberRegexp,
  expiryDateRegexp,
  creditCardBlocks,
  creditCardRegexes,
};

const regex = {
  expiryDate: '(1[0-2]|0[1-9])/dd',
  cardNumber: '\\d{4} \\d{4} \\d{4} \\d{4}',
};

export const cardNumberRegexp = new RegExp(regex.cardNumber);
export const expiryDate = new RegExp(regex.expiryDate);

export const creditCardCheck = {
  blocks: {
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
  },

  regexes: {
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
  },
};

/**
 * 4847 3529 8926 3094 - valid visa credit card
 * sum of odd places = 48
 * double even places = 52
 * if it is greater than 9 -> sum both digits
 * if sum of those above is divisible by ten, YOU HAVE VALID CARD !
 */

export const creditCardValidation = (cardNumber: string) => {
  const arry = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  let len = cardNumber.length,
    bit = 1,
    sum = 0,
    val;

  while (len) {
    val = parseInt(cardNumber.charAt(--len), 10);
    sum += (bit ^= 1) ? arry[val] : val;
  }

  return sum && sum % 10 === 0;
};

export const getCardLogo = (brand: string) => {
  if (brand === 'amex') {
    return 'https://s3-eu-central-1.amazonaws.com/centaur-wp/designweek/prod/content/uploads/2018/04/10121846/am_amex_06.jpg';
  } else if (brand === 'dankort') {
    return 'https://vignette.wikia.nocookie.net/logopedia/images/b/b4/Dankort_logo_1983-2001.png/revision/latest?cb=20171104083621';
  } else if (brand === 'diners') {
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2aDEyCorzJ53G5u56L2IZw_TuYRi3e1U70hqrxrrmCWrpuLUb';
  } else if (brand === 'discover') {
    return 'https://jleconsultants.com/wp-content/uploads/2018/01/Discover-Logo-370x370.jpeg';
  } else if (brand === 'instapayment') {
    return 'https://mark.trademarkia.com/logo-images/bitpay-llc/instapay-85386032.jpg';
  } else if (brand === 'jcb') {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/300px-JCB_logo.svg.png';
  } else if (brand === 'jcb15') {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/300px-JCB_logo.svg.png';
  } else if (brand === 'mastercard') {
    return `http://logok.org/wp-content/uploads/2014/03/Mastercard-logo-2016-logotype.png`;
  } else if (brand === 'maestro') {
    return 'https://brand.mastercard.com/content/dam/mccom/brandcenter/other-marks/ms_vrt_87_2x.png';
  } else if (brand === 'mir') {
    return 'http://onlinereg.ru/ICINS2018/cards2.png';
  } else if (brand === 'uatp') {
    return 'https://uatp.com/wp-content/uploads/2016/08/website_UATPLogo.png';
  } else if (brand === 'unionPay') {
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5i6ga6VK-wA7dgb3itjsnRRuqabySYEc8Tg4gZ13NkJ3CWr7U';
  } else if (brand === 'visa') {
    return 'https://resources.mynewsdesk.com/image/upload/t_next_gen_article_large_480/ojf8ed4taaxccncp6pcp.jpg';
  } else {
    return 'https://image.flaticon.com/icons/svg/138/138286.svg';
  }
};

export const getInfo = (value: string) => {
  let blocks = creditCardCheck.blocks,
    regexes = creditCardCheck.regexes;

  for (var key in regexes) {
    if (regexes[key].test(value)) {
      var block;
      block = blocks[key];
      return {
        type: key,
        blocks: block,
      };
    }
  }

  return {
    type: 'unknown',
    blocks: blocks.general,
  };
};

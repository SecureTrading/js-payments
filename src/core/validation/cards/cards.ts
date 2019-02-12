/**
 * 4847 3529 8926 3094 - valid visa credit card
 * Luhn Algorith
 * sum of odd places = 48
 * double even places = 52
 * if it is greater than 9 -> sum both digits
 * if sum of those above is divisible by ten, YOU HAVE VALID CARD !
 */

import { creditCardRegexes, creditCardBlocks } from './regex';

const creditCardValidation = (cardNumber: string) => {
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

const getCardLogo = (brand: string) => {
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

const getInfo = (value: string) => {
  for (var key in creditCardRegexes) {
    if (creditCardRegexes[key].test(value)) {
      var block;
      block = creditCardBlocks[key];
      return {
        type: key,
        blocks: block,
      };
    }
  }

  return {
    type: 'unknown',
    blocks: creditCardBlocks.general,
  };
};

export { getCardLogo, getInfo, creditCardValidation };

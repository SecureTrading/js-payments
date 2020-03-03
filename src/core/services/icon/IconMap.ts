import { Service } from 'typedi';

const mapIcon = {
  amex: `./images/amex.png`,
  astropaycard: `./images/astropaycard.png`,
  diners: `./images/diners.png`,
  discover: `./images/discover.png`,
  jcb: `./images/jcb.png`,
  maestro: `./images/maestro.png`,
  mastercard: `./images/mastercard.png`,
  piba: `./images/piba.png`,
  visa: `./images/visa.png`
};

@Service()
export const IconMap = (name: string) => {
  // @ts-ignore
  return mapIcon[name];
};

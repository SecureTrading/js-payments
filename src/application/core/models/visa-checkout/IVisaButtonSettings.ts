export interface IVisaButtonSettings {
  size?: number;
  height?: 34 | 47 | 94;
  width?: number;
  locale?: string;
  color?: 'neutral' | 'standard';
  cardBrands?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'ELECTRON' | 'ELO';
  acceptCanadianVisaDebit?: 'true' | 'false';
  cobrand?: 'true' | 'false';
}

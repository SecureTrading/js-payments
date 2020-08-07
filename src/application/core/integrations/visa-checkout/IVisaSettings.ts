export interface IVisaSettings {
  locale?: string;
  countryCode?: string;
  displayName?: string;
  websiteUrl?: string;
  customerSupportUrl?: string;
  enableUserDataPrefill?: boolean;
  shipping?: {
    acceptedRegions?: string[];
    collectShipping?: 'true' | 'false';
  };
  payment?: {
    cardBrands?: string[];
    acceptCanadianVisaDebit?: 'true' | 'false';
    billingCountries?: string[];
  };
  review?: {
    message?: string;
    buttonAction?: string;
  };
  threeDSSetup?: {
    threeDSActive?: 'true' | 'false';
    threeDSSuppressChallenge?: 'true' | 'false';
  };
  dataLevel?: string;
}

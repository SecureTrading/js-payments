export interface IVisaCheckout {
  merchantId: string; // That's VisaCheckout apikey property
  livestatus: 0 | 1;
  encryptionKey?: string;
  placement: string;
  requestTypes: [];
  buttonSettings?: {
    size?: number;
    height?: number;
    width?: number;
    locale?: string;
    color?: 'neutral' | 'standard';
    cardBrands?: string;
    acceptCanadianVisaDebit?: string;
    cobrand?: string;
  };
  settings?: {
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
  };
  paymentRequest?: {
    merchantRequestId?: string;
    currencyCode?: string;
    subtotal?: string;
    shippingHandling?: string;
    tax?: string;
    discount?: string;
    giftWrap?: string;
    misc?: string;
    total?: string;
    orderId?: string;
    description?: string;
    promoCode?: string;
    customData?: any;
  };
}

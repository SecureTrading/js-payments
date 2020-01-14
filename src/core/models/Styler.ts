interface ISubStyles {
  [key: string]: string;
}

interface IGroupedStyles {
  [key: string]: ISubStyles;
}

interface IStyle {
  [identifier: string]: string;
}

interface IStyles {
  defaultStyles?: IStyle;
  cardNumber?: IStyle;
  expirationDate?: IStyle;
  securityCode?: IStyle;
  notificationFrame?: IStyle;
  controlFrame?: IStyle;
}

interface IAllowedStyles {
  [identifier: string]: {
    selector: string;
    property: string;
  };
}

export { IAllowedStyles, IGroupedStyles, IStyle, IStyles, ISubStyles };

interface ICard {
  expirydate: string;
  pan: string;
  securitycode: string;
}

interface ICardFramesPublishEvent {
  cybertonicaApiKey: string;
  deferInit: boolean | undefined;
  updateJWT: boolean | undefined;
}

export { ICard, ICardFramesPublishEvent };

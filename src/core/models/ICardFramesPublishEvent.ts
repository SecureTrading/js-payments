export interface ICardFramesPublishEvent {
  bypassCards: string[];
  cybertonicaApiKey: string;
  deferInit: boolean | undefined;
  updateJWT: boolean | undefined;
  fieldsToSubmit: string[];
}

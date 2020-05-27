export interface ISubmitData {
  [index: string]: string;
  fieldsToSubmit?: string[];
  dataInJwt?: boolean;
  requestTypes?: string[];
}

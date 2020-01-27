import { ICybertonicaPostResponse } from './ICybertonica';

export interface ISubmitData {
  fieldsToSubmit?: string[];
  bypassCards?: string[];
  deferInit?: boolean;
  dataInJwt?: boolean;
  requestTypes?: string[];
  response: ICybertonicaPostResponse;
}

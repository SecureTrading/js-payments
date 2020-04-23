import { environment } from '../../../../../environments/environment';
import { DefaultFieldsToSubmit } from './DefaultFieldsToSubmit';
import { Selectors } from '../../../shared/Selectors';
import { DefaultComponentsRequestTypes } from './DefaultComponentsRequestTypes';
import { DefaultSubmitFields } from './DefaultSubmitFields';
import { DefaultComponentsIds } from './DefaultComponentsIds';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { DefaultComponents } from './DefaultComponents';
import { DefaultPlaceholders } from './DefaultPlaceholders';
import { DefaultInit } from './DefaultInit';
import { DefaultRequestTypes } from './DefaultRequestTypes';

export const DefaultConfig: IConfig = {
  analytics: false,
  animatedCard: false,
  applePay: {},
  buttonId: '',
  bypassCards: [],
  cachetoken: '',
  cancelCallback: null,
  componentIds: DefaultComponentsIds,
  components: DefaultComponents,
  cybertonicaApiKey: '',
  datacenterurl: environment.GATEWAY_URL,
  deferInit: false,
  disableNotification: false,
  errorCallback: null,
  fieldsToSubmit: DefaultFieldsToSubmit,
  formId: Selectors.MERCHANT_FORM_SELECTOR,
  init: DefaultInit,
  jwt: '',
  livestatus: 0,
  origin: window.location.origin,
  panIcon: false,
  placeholders: DefaultPlaceholders,
  requestTypes: DefaultRequestTypes,
  styles: {},
  submitCallback: null,
  submitFields: DefaultSubmitFields,
  submitOnError: false,
  submitOnSuccess: true,
  successCallback: null,
  threedinit: '',
  translations: {},
  visaCheckout: {}
};

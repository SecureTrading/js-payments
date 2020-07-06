import { environment } from '../../../../../environments/environment';
import { DefaultFieldsToSubmit } from './DefaultFieldsToSubmit';
import { Selectors } from '../../../shared/Selectors';
import { DefaultSubmitFields } from './DefaultSubmitFields';
import { DefaultComponentsIds } from './DefaultComponentsIds';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { DefaultComponents } from './DefaultComponents';
import { DefaultPlaceholders } from './DefaultPlaceholders';
import { DefaultInit } from './DefaultInit';

export const DefaultConfig: IConfig = {
  analytics: false,
  animatedCard: false,
  applePay: {},
  buttonId: '',
  bypassCards: [],
  cancelCallback: null,
  componentIds: DefaultComponentsIds,
  components: DefaultComponents,
  cybertonicaApiKey: 'stfs',
  datacenterurl: environment.GATEWAY_URL,
  deferInit: false,
  disableNotification: false,
  errorCallback: null,
  errorReporting: false,
  fieldsToSubmit: DefaultFieldsToSubmit,
  formId: Selectors.MERCHANT_FORM_SELECTOR,
  init: DefaultInit,
  jwt: '',
  livestatus: 0,
  origin: window.location.origin,
  panIcon: false,
  placeholders: DefaultPlaceholders,
  styles: {},
  submitCallback: null,
  submitFields: DefaultSubmitFields,
  submitOnError: false,
  submitOnSuccess: true,
  successCallback: null,
  translations: {},
  visaCheckout: {}
};

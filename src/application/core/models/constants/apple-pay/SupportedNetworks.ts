const BASIC_SUPPORTED_NETWORKS = [
  'amex',
  'chinaUnionPay',
  'discover',
  'interac',
  'jcb',
  'masterCard',
  'privateLabel',
  'visa'
];
const VERSION_4_SUPPORTED_NETWORKS = BASIC_SUPPORTED_NETWORKS.concat([
  'cartesBancaires',
  'eftpos',
  'electron',
  'maestro',
  'vPay'
]);
const VERSION_5_SUPPORTED_NETWORKS = BASIC_SUPPORTED_NETWORKS.concat(['elo', 'mada']);

export { BASIC_SUPPORTED_NETWORKS, VERSION_4_SUPPORTED_NETWORKS, VERSION_5_SUPPORTED_NETWORKS };

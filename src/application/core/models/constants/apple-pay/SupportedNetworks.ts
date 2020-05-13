const STAGE_ONE_NETWORKS = [
  'amex',
  'chinaUnionPay',
  'discover',
  'interac',
  'jcb',
  'masterCard',
  'privateLabel',
  'visa'
];
const STAGE_TWO_NETWORKS = STAGE_ONE_NETWORKS.concat(['cartesBancaires', 'eftpos', 'electron', 'maestro', 'vPay']);
const STAGE_THREE_NETWORKS = STAGE_ONE_NETWORKS.concat(['elo', 'mada']);

export { STAGE_ONE_NETWORKS, STAGE_TWO_NETWORKS, STAGE_THREE_NETWORKS };

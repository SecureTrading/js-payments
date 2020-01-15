const ON_CARDINAL_VALIDATED_STATUS = ['SUCCESS', 'NOACTION', 'FAILURE'];

const PAYMENT_BRAND: string = 'cca';
const PAYMENT_EVENTS = {
  BIN_PROCESS: 'bin.process',
  INIT: 'init',
  SETUP_COMPLETE: 'payments.setupComplete',
  VALIDATED: 'payments.validated'
};

export { ON_CARDINAL_VALIDATED_STATUS, PAYMENT_BRAND, PAYMENT_EVENTS };

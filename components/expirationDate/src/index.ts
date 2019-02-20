import './style.scss';
import ExpireDate from '../../../src/core/classes/validation/ExpireDate.class';
import { inputListener } from '../../../src/core/listeners/input';

inputListener(
  'expirationDate',
  'st-expiration-date',
  'expiration-date-month',
  'expiration-date'
);
inputListener(
  'expirationDate',
  'st-expiration-date',
  'expiration-date-year',
  'expiration-date'
);

const inputValidation = new ExpireDate();
inputValidation.isSelectEmpty('expiration-date-month');
inputValidation.isSelectEmpty('expiration-date-year');

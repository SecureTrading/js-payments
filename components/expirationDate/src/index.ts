import './style.scss';
import ExpirationDate from '../../../src/core/classes/validation/ExpirationDate.class';
import { inputListener } from '../../../src/core/listeners/input';

inputListener(
  'expirationDate',
  'st-expiration-date',
  'expiration-date',
  'expiration-date'
);

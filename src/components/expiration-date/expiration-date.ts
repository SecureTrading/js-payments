import './expiration-date.scss';
import ExpirationDate from '../../../src/core/classes/validation/ExpirationDate.class';

if (document.getElementById('st-expiration-date-input')) {
  new ExpirationDate('st-expiration-date-input');
}

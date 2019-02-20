import './style.scss';
import ExpireDate from '../../../src/core/classes/validation/ExpireDate.class';
import { inputListener } from '../../../src/core/listeners/input';

inputListener('expirationDate', 'st-expiration-date', 'expiration-date-month');
inputListener('expirationDate', 'st-expiration-date', 'expiration-date-year');

const inputValidation = new ExpireDate();
inputValidation.isSelectEmpty('expiration-date-month');
inputValidation.isSelectEmpty('expiration-date-year');

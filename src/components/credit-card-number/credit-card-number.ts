import './credit-card-number.scss';
import CardNumber from '../../../src/core/classes/validation/CardNumber.class';

if (document.getElementById('st-card-number-input')) {
  new CardNumber('st-card-number-input');
}

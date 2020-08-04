import { Utils } from './Utils';
import { Container, Service } from 'typedi';
import { Validation } from './Validation';

@Service()
export class Formatter {
  private _blocks: number[] = [2, 2];
  private _cardNumberFormatted: string;
  private _dateBlocks = {
    currentDateMonth: '',
    currentDateYear: '',
    previousDateYear: ''
  };
  private _date: string[] = ['', ''];
  private _validation: Validation;

  constructor() {
    this._validation = Container.get(Validation);
  }

  public number(cardNumber: string, id: string) {
    this._validation.cardNumber(cardNumber);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    const cardNumberCleaned: string = this._validation.removeNonDigits(this._validation.cardNumberValue);
    element.value = cardNumberCleaned;
    const cardDetails = this._validation.getCardDetails(cardNumberCleaned);
    const format = cardDetails ? cardDetails.format : '(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?';
    const previousValue = cardNumberCleaned;
    let value = previousValue;
    let selectEnd = element.selectionEnd;
    let selectStart = element.selectionStart;
    if (format && value.length > 0) {
      value = Utils.stripChars(value, undefined);
      let matches = value.match(new RegExp(format, '')).slice(1);
      if (Utils.inArray(matches, undefined)) {
        matches = matches.slice(0, matches.indexOf(undefined));
      }
      const matched = matches.length;
      if (format && matched > 1) {
        const preMatched = previousValue.split(' ').length;
        selectStart += matched - preMatched;
        selectEnd += matched - preMatched;
        value = matches.join(' ');
      }
    }

    if (value !== previousValue) {
      Utils.setElementAttributes({ value }, element);
      element.setSelectionRange(selectStart, selectEnd);
    }
    this._cardNumberFormatted = value ? value : '';
    if (value) {
      this._validation.cardNumberValue = value.replace(/\s/g, '');
    }
    return { formatted: this._cardNumberFormatted, nonformatted: this._validation.cardNumberValue };
  }

  public date(value: string, id?: string) {
    this._validation.expirationDate(value);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    let result: string = '';

    this._blocks.forEach(length => {
      if (this._validation.expirationDateValue && this._validation.expirationDateValue.length > 0) {
        const sub = this._validation.expirationDateValue.slice(0, length);
        const rest = this._validation.expirationDateValue.slice(length);
        result += sub;
        this._validation.expirationDateValue = rest;
      }
    });
    let fixedDate = this._dateFixed(result);
    element.value = fixedDate;
    fixedDate = fixedDate ? fixedDate : '';
    return fixedDate;
  }

  public code(value: string, length: number, id?: string) {
    this._validation.securityCode(value, length);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    element.value = this._validation.securityCodeValue ? this._validation.securityCodeValue : '';
    return this._validation.securityCodeValue;
  }

  private _dateISO(previousDate: string[], currentDate: string[]) {
    this._dateBlocks.currentDateMonth = currentDate[0];
    this._dateBlocks.currentDateYear = currentDate[1];
    this._dateBlocks.previousDateYear = previousDate[1];

    if (!this._dateBlocks.currentDateMonth.length) {
      return '';
    } else if (this._dateBlocks.currentDateMonth.length && this._dateBlocks.currentDateYear.length === 0) {
      return this._dateBlocks.currentDateMonth;
    } else if (
      this._dateBlocks.currentDateMonth.length === 2 &&
      this._dateBlocks.currentDateYear.length === 1 &&
      this._dateBlocks.previousDateYear.length === 0
    ) {
      return this._dateBlocks.currentDateMonth + '/' + this._dateBlocks.currentDateYear;
    } else if (
      (this._dateBlocks.currentDateMonth.length === 2 &&
        this._dateBlocks.currentDateYear.length === 1 &&
        (this._dateBlocks.previousDateYear.length === 1 || this._dateBlocks.previousDateYear.length === 2)) ||
      (this._dateBlocks.currentDateMonth.length === 2 && this._dateBlocks.currentDateYear.length === 2)
    ) {
      return this._dateBlocks.currentDateMonth + '/' + this._dateBlocks.currentDateYear;
    }
  }

  private _dateFixed(value: string) {
    let date: string[];
    const month: string = value.slice(0, 2);
    const year: string = value.slice(2, 4);
    date = [month, year];
    return this._dateISO(this._date, date);
  }
}

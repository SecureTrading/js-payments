import Utils from './Utils';
import Validation from './Validation';

class Formatter extends Validation {
  private _blocks: number[] = [2, 2];
  private _cardNumberFormatted: string;
  private _dateBlocks = {
    currentDateMonth: '',
    currentDateYear: '',
    previousDateYear: ''
  };
  private _date: string[] = ['', ''];

  public number(cardNumber: string, id: string) {
    super.cardNumber(cardNumber);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    const cardNumberCleaned: string = this.removeNonDigits(this.cardNumberValue);
    element.value = cardNumberCleaned;
    const cardDetails = this.getCardDetails(cardNumberCleaned);
    const format = cardDetails ? cardDetails.format : Formatter.STANDARD_FORMAT_PATTERN;
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
    this._cardNumberFormatted = value;
    if (value) {
      this.cardNumberValue = value.replace(/\s/g, '');
    }
    value = value ? value : '';
    return { value, nonformat: this.cardNumberValue };
  }

  public date(value: string, id?: string) {
    super.expirationDate(value);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    let result: string = '';

    this._blocks.forEach(length => {
      if (this.expirationDateValue && this.expirationDateValue.length > 0) {
        const sub = this.expirationDateValue.slice(0, length);
        const rest = this.expirationDateValue.slice(length);
        result += sub;
        this.expirationDateValue = rest;
      }
    });
    let fixedDate = this._dateFixed(result);
    element.value = fixedDate;
    fixedDate = fixedDate ? fixedDate : '';
    return fixedDate;
  }

  public code(value: string, length: number, id?: string) {
    super.securityCode(value, length);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    element.value = this.securityCodeValue ? this.securityCodeValue : '';
    return this.securityCodeValue;
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

export default Formatter;

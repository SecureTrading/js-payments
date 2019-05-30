export default abstract class Formatter {
  public static trimNonNumeric(data: string): string {
    return data.trim().replace(Formatter.DATA_NON_NUMERIC, '');
  }

  public static trimNonNumericExceptSlash(data: string): string {
    return data.trim().replace(Formatter.DATA_NON_NUMERIC_EXCEPT_SLASH, '');
  }
  public static trimNonNumericExceptSpace(data: string): string {
    return data.trim().replace(Formatter.DATA_NON_NUMERIC_EXCEPT_SPACE, '');
  }

  public static maskExpirationDate(data: string): string {
    const length = data.length;
    return length === 3 && data[2] !== '/' ? `${data[0]}${data[1]}/${data[2]}` : data;
  }

  public static maskExpirationDateOnPaste(data: string): string {
    let value;
    value = Formatter.trimNonNumeric(data);
    if (value.length >= Formatter.EXPIRATION_DATE_DIGITS_AMOUNT) {
      value = data.slice(0, Formatter.EXPIRATION_DATE_DIGITS_AMOUNT);
      value = value.replace(Formatter.EXPIRATION_DATE_FORMAT, Formatter.EXPIRATION_DATE_REPLACE_VALUE);
    } else if (value.length === 3) {
      value = `${value[0]}${value[1]}/${value[2]}`;
    }
    return value;
  }

  private static DATA_NON_NUMERIC: RegExp = /\D/g;
  private static DATA_NON_NUMERIC_EXCEPT_SLASH: RegExp = /[^0-9\/]/g;
  private static DATA_NON_NUMERIC_EXCEPT_SPACE: RegExp = /[^0-9\ ]/g;

  private static EXPIRATION_DATE_DIGITS_AMOUNT = 4;
  private static EXPIRATION_DATE_FORMAT = /^([\d]{2})([\d]{2})$/;
  private static EXPIRATION_DATE_REPLACE_VALUE = '$1/$2';
}

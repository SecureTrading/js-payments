export default abstract class Formatter {
  public static trimNonNumeric(data: string): string {
    return data.trim().replace(Formatter.DATA_NON_NUMERIC, '');
  }

  public static maskExpirationDate(data: string): string {
    if (Formatter.DATE_MONTH_WITHOUT_SEPARATOR.test(data)) {
      return `${data}/`;
    } else if (Formatter.DATE_MONTH_WITH_SEPARATOR.test(data)) {
      return data.replace('/', '');
    } else {
      return data;
    }
  }

  public static maskExpirationDateOnPaste(data: string): string {
    let value;
    if (data.length >= 4) {
      value = data.slice(0, 4);
      value = value.replace(/^([\d]{2})([\d]{2})$/, '$1/$2');
    }
    return value;
  }

  private static DATA_NON_NUMERIC: RegExp = /\D/g;
  private static DATE_MONTH_WITH_SEPARATOR: RegExp = /^\d\d\/$/;
  private static DATE_MONTH_WITHOUT_SEPARATOR: RegExp = /^\d\d$/;
}
